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
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionImportService {

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

        for (CsvRow row : rows) {
            results.add(importRow(email, row));
        }

        int importedRows = (int) results.stream().filter(CsvImportRowResultDto::imported).count();
        int totalRows = results.size();
        return new CsvImportResultDto(totalRows, importedRows, totalRows - importedRows, results);
    }

    public Transaction importText(String email, TextExtractRequest request) {
        if (request == null || request.getText() == null || request.getText().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text is required");
        }

        CsvImportRowResultDto result = importRow(email, new CsvRow(1, request.getText()));
        if (!result.imported()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, result.message());
        }

        return result.transaction();
    }

    private CsvImportRowResultDto importRow(String email, CsvRow row) {
        try {
            String aiJson = aiClientService.extractFinancialEntities(row.rawText());
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

    private Transaction toTransaction(ExtractedFinancialEntitiesDto extracted) {
        validateExtractedTransaction(extracted);

        Transaction transaction = new Transaction();
        transaction.setDate(parseDate(extracted.date()));
        transaction.setAmount(parseAmount(extracted.amount()));
        transaction.setMerchantName(extracted.merchant());
        transaction.setCategory(extracted.category());
        return transaction;
    }

    private void validateExtractedTransaction(ExtractedFinancialEntitiesDto extracted) {
        if (extracted == null) {
            throw new IllegalArgumentException("AI returned an empty transaction");
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

    private LocalDate parseDate(String value) {
        return value == null || value.isBlank() ? null : LocalDate.parse(value);
    }

    private BigDecimal parseAmount(Double value) {
        return value == null ? null : BigDecimal.valueOf(value);
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
            String line;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank() || isHeader(line)) {
                    continue;
                }

                rows.add(new CsvRow(lineNumber, line));
            }

            if (rows.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV file did not contain any data rows");
            }

            return rows;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read CSV file", ex);
        }
    }

    private boolean isHeader(String line) {
        String normalized = line.trim().toLowerCase();
        return normalized.equals("date,merchant,amount");
    }

    private record CsvRow(int rowNumber, String rawText) {
    }
}
