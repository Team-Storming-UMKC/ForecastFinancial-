package edu.umkc.teamstorming.bank_api.transaction;

import edu.umkc.teamstorming.bank_api.ai.AiClientService;
import edu.umkc.teamstorming.bank_api.ai.LmStudioParser;
import edu.umkc.teamstorming.bank_api.dto.CsvImportResultDto;
import edu.umkc.teamstorming.bank_api.dto.CsvImportRowResultDto;
import edu.umkc.teamstorming.bank_api.dto.ExtractedFinancialEntitiesDto;
import edu.umkc.teamstorming.bank_api.dto.TextExtractRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class TransactionImportService {

    private static final int AI_BATCH_SIZE = 50;
    private static final double MIN_CONFIDENCE = 0.70;

    private final AiClientService aiClientService;
    private final LmStudioParser lmStudioParser;
    private final TransactionService transactionService;

    public TransactionImportService(AiClientService aiClientService,
                                    LmStudioParser lmStudioParser,
                                    TransactionService transactionService) {
        this.aiClientService = aiClientService;
        this.lmStudioParser = lmStudioParser;
        this.transactionService = transactionService;
    }

    public CsvImportResultDto importCsv(String email, MultipartFile file) {
        validateFile(file);

        List<CsvImportRowResultDto> results = new ArrayList<>();
        List<CsvRow> rows = readCsvRows(file);

        for (int start = 0; start < rows.size(); start += AI_BATCH_SIZE) {
            int end = Math.min(start + AI_BATCH_SIZE, rows.size());
            results.addAll(importBatch(email, rows.subList(start, end)));
        }

        int importedRows = (int) results.stream().filter(CsvImportRowResultDto::imported).count();
        int totalRows = results.size();
        return new CsvImportResultDto(totalRows, importedRows, totalRows - importedRows, results);
    }

    public Transaction importText(String email, TextExtractRequest request) {
        if (request == null || request.getText() == null || request.getText().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text is required");
        }

        try {
            String aiJson = aiClientService.extractFinancialEntities(request.getText());
            List<ExtractedFinancialEntitiesDto> extractedItems = lmStudioParser.readEntitiesJsonList(aiJson);

            if (extractedItems.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "AI did not return any transactions");
            }

            if (extractedItems.size() > 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "AI returned multiple transactions for one text entry");
            }

            Transaction transaction = toTransactionForText(extractedItems.getFirst());
            return transactionService.create(email, transaction);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    private CsvImportRowResultDto importRow(String email, CsvRow row) {
        try {
            String aiJson = aiClientService.extractFinancialEntities(row.aiText());
            List<ExtractedFinancialEntitiesDto> extractedItems = lmStudioParser.readEntitiesJsonList(aiJson);

            if (extractedItems.isEmpty()) {
                return new CsvImportRowResultDto(row.rowNumber(), row.rawText(), false,
                        "AI did not return any transactions", null);
            }

            if (extractedItems.size() > 1) {
                return new CsvImportRowResultDto(row.rowNumber(), row.rawText(), false,
                        "AI returned multiple transactions for one CSV row", null);
            }

            Transaction transaction = toTransaction(extractedItems.getFirst());
            Transaction saved = transactionService.create(email, transaction);

            return new CsvImportRowResultDto(row.rowNumber(), row.rawText(), true, "Success", saved);
        } catch (Exception ex) {
            return new CsvImportRowResultDto(row.rowNumber(), row.rawText(), false, ex.getMessage(), null);
        }
    }

    private List<CsvImportRowResultDto> importBatch(String email, List<CsvRow> batchRows) {
        try {
            String aiJson = aiClientService.extractFinancialEntitiesBatch(
                    batchRows.stream().map(CsvRow::aiText).toList()
            );
            List<ExtractedFinancialEntitiesDto> extractedItems = lmStudioParser.readEntitiesJsonList(aiJson);

            if (extractedItems.size() != batchRows.size()) {
                return fallbackToSingleRowImport(email, batchRows,
                        "AI batch response size did not match CSV batch size");
            }

            List<Transaction> transactionsToSave = new ArrayList<>();
            List<Integer> successfulIndexes = new ArrayList<>();
            List<CsvImportRowResultDto> provisionalResults = new ArrayList<>();

            for (int i = 0; i < batchRows.size(); i++) {
                CsvRow row = batchRows.get(i);
                try {
                    Transaction transaction = toTransaction(extractedItems.get(i));
                    transactionsToSave.add(transaction);
                    successfulIndexes.add(i);
                    provisionalResults.add(new CsvImportRowResultDto(
                            row.rowNumber(), row.rawText(), true, "Success", transaction
                    ));
                } catch (Exception ex) {
                    provisionalResults.add(new CsvImportRowResultDto(
                            row.rowNumber(), row.rawText(), false, ex.getMessage(), null
                    ));
                }
            }

            if (transactionsToSave.isEmpty()) {
                return provisionalResults;
            }

            List<Transaction> savedTransactions = transactionService.createAll(email, transactionsToSave);
            Map<Integer, Transaction> savedByIndex = new HashMap<>();
            for (int i = 0; i < successfulIndexes.size(); i++) {
                savedByIndex.put(successfulIndexes.get(i), savedTransactions.get(i));
            }

            List<CsvImportRowResultDto> finalResults = new ArrayList<>(provisionalResults.size());
            for (int i = 0; i < provisionalResults.size(); i++) {
                CsvImportRowResultDto result = provisionalResults.get(i);
                if (!result.imported()) {
                    finalResults.add(result);
                    continue;
                }

                finalResults.add(new CsvImportRowResultDto(
                        result.rowNumber(),
                        result.rawRow(),
                        true,
                        result.message(),
                        savedByIndex.get(i)
                ));
            }

            return finalResults;
        } catch (Exception ex) {
            return fallbackToSingleRowImport(email, batchRows, ex.getMessage());
        }
    }

    private List<CsvImportRowResultDto> fallbackToSingleRowImport(String email, List<CsvRow> batchRows, String reason) {
        List<CsvImportRowResultDto> results = new ArrayList<>(batchRows.size());
        for (CsvRow row : batchRows) {
            CsvImportRowResultDto singleResult = importRow(email, row);
            String message = singleResult.imported()
                    ? "Success"
                    : singleResult.message() + " (batch fallback: " + reason + ")";
            results.add(new CsvImportRowResultDto(
                    singleResult.rowNumber(),
                    singleResult.rawRow(),
                    singleResult.imported(),
                    message,
                    singleResult.transaction()
            ));
        }
        return results;
    }

    private Transaction toTransaction(ExtractedFinancialEntitiesDto extracted) {
        validateExtractedTransaction(extracted);

        Transaction transaction = new Transaction();
        transaction.setDate(parseDate(extracted.date()));
        transaction.setAmount(parseAmount(extracted.amount()));
        transaction.setMerchantName(formatCsvMerchantName(extracted.merchant()));
        transaction.setCategory(formatCsvCategory(extracted.category()));
        return transaction;
    }

    private Transaction toTransactionForText(ExtractedFinancialEntitiesDto extracted) {
        validateExtractedTransactionForText(extracted);

        Transaction transaction = new Transaction();
        transaction.setDate(parseDateOrToday(extracted.date()));
        transaction.setAmount(parseAmount(extracted.amount()));
        transaction.setMerchantName(extracted.merchant());
        transaction.setCategory(extracted.category());
        return transaction;
    }

    private void validateExtractedTransaction(ExtractedFinancialEntitiesDto extracted) {
        if (extracted == null) {
            throw new IllegalArgumentException("AI returned an empty transaction");
        }
        if (extracted.confidence() == null || extracted.confidence() < MIN_CONFIDENCE) {
            throw new IllegalArgumentException("AI confidence too low");
        }
        if (extracted.date() == null || extracted.date().isBlank()) {
            throw new IllegalArgumentException("AI returned null date");
        }
        if (extracted.amount() == null) {
            throw new IllegalArgumentException("AI returned null amount");
        }
        if (extracted.merchant() == null || extracted.merchant().isBlank()) {
            throw new IllegalArgumentException("AI returned null merchant");
        }
        if (extracted.category() == null || extracted.category().isBlank()) {
            throw new IllegalArgumentException("AI returned null category");
        }
    }

    private void validateExtractedTransactionForText(ExtractedFinancialEntitiesDto extracted) {
        if (extracted == null) {
            throw new IllegalArgumentException("AI returned an empty transaction");
        }
        if (extracted.amount() == null) {
            throw new IllegalArgumentException("AI returned null amount");
        }
        if (extracted.merchant() == null || extracted.merchant().isBlank()) {
            throw new IllegalArgumentException("AI returned null merchant");
        }
        if (extracted.category() == null || extracted.category().isBlank()) {
            throw new IllegalArgumentException("AI returned null category");
        }
    }

    private LocalDate parseDate(String value) {
        return value == null || value.isBlank() ? null : LocalDate.parse(value);
    }

    private LocalDate parseDateOrToday(String value) {
        if (value == null || value.isBlank()) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            return LocalDate.now();
        }
    }

    private BigDecimal parseAmount(Double value) {
        return value == null ? null : BigDecimal.valueOf(value);
    }

    private String formatCsvMerchantName(String value) {
        return collapseWhitespace(value).toUpperCase(Locale.ROOT);
    }

    private String formatCsvCategory(String value) {
        return collapseWhitespace(value);
    }

    private String collapseWhitespace(String value) {
        return value == null ? null : value.trim().replaceAll("\\s+", " ");
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV file is required");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File must be a .csv");
        }
    }

    private List<CsvRow> readCsvRows(MultipartFile file) {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<CsvRow> rows = new ArrayList<>();
            List<String> headers = List.of();
            String line;
            int lineNumber = 0;
            boolean firstDataLineSeen = false;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }

                List<String> columns = parseCsvLine(line);
                if (!firstDataLineSeen && looksLikeHeader(columns)) {
                    headers = columns;
                    firstDataLineSeen = true;
                    continue;
                }

                firstDataLineSeen = true;
                rows.add(new CsvRow(lineNumber, line, toAiText(headers, columns, line)));
            }

            if (rows.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV file did not contain any data rows");
            }

            return rows;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read CSV file", ex);
        }
    }

    private boolean looksLikeHeader(List<String> columns) {
        int recognizedHeaders = 0;
        for (String column : columns) {
            if (isKnownTransactionHeader(column)) {
                recognizedHeaders++;
            }
        }

        return recognizedHeaders >= 2;
    }

    private boolean isKnownTransactionHeader(String value) {
        String normalized = normalizeHeader(value);
        return normalized.contains("date")
                || normalized.contains("posted")
                || normalized.contains("merchant")
                || normalized.contains("description")
                || normalized.contains("payee")
                || normalized.contains("name")
                || normalized.contains("vendor")
                || normalized.contains("memo")
                || normalized.contains("amount")
                || normalized.contains("debit")
                || normalized.contains("credit")
                || normalized.contains("withdrawal")
                || normalized.contains("deposit")
                || normalized.contains("charge")
                || normalized.contains("payment")
                || normalized.contains("category");
    }

    private String normalizeHeader(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private String toAiText(List<String> headers, List<String> columns, String rawLine) {
        if (headers.isEmpty()) {
            return rawLine;
        }

        StringBuilder labelledRow = new StringBuilder("CSV row with headers: ");
        int labelledColumnCount = Math.max(headers.size(), columns.size());
        for (int i = 0; i < labelledColumnCount; i++) {
            if (i > 0) {
                labelledRow.append("; ");
            }

            String header = i < headers.size() && !headers.get(i).isBlank()
                    ? headers.get(i).trim()
                    : "column " + (i + 1);
            String value = i < columns.size() ? columns.get(i).trim() : "";
            labelledRow.append(header).append("=").append(value);
        }
        labelledRow.append(". Original CSV row: ").append(rawLine);
        return labelledRow.toString();
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char currentChar = line.charAt(i);
            if (currentChar == '"') {
                boolean escapedQuote = inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"';
                if (escapedQuote) {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (currentChar == ',' && !inQuotes) {
                values.add(current.toString());
                current.setLength(0);
            } else {
                current.append(currentChar);
            }
        }

        values.add(current.toString());
        return values;
    }

    private record CsvRow(int rowNumber, String rawText, String aiText) {
    }
}
