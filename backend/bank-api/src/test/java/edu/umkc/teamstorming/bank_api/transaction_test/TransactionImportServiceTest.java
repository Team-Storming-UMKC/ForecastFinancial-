package edu.umkc.teamstorming.bank_api.transaction;

import edu.umkc.teamstorming.bank_api.ai.AiClientService;
import edu.umkc.teamstorming.bank_api.ai.LmStudioParser;
import edu.umkc.teamstorming.bank_api.dto.CsvImportResultDto;
import edu.umkc.teamstorming.bank_api.dto.TextExtractRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TransactionImportServiceTest {

    private AiClientService aiClientService;
    private LmStudioParser lmStudioParser;
    private TransactionService transactionService;
    private TransactionImportService transactionImportService;

    @BeforeEach
    void setUp() {
        aiClientService = Mockito.mock(AiClientService.class);
        lmStudioParser = new LmStudioParser(new com.fasterxml.jackson.databind.ObjectMapper());
        transactionService = Mockito.mock(TransactionService.class);
        transactionImportService = new TransactionImportService(aiClientService, lmStudioParser, transactionService);
    }

    @Test
    void importCsv_importsValidRowsAndSkipsHeader() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "transactions.csv",
                "text/csv",
                "date,merchant,amount\n2022-01-02,Gas Station,60.0".getBytes()
        );
        Transaction saved = new Transaction("Gas Station", new BigDecimal("60.0"),
                LocalDate.of(2022, 1, 2), "Auto & transport", null);

        when(aiClientService.extractFinancialEntitiesBatch(anyList())).thenReturn("""
                [{"amount":60.0,"currency":"USD","date":"2022-01-02","merchant":"Gas Station","category":"Auto & transport","note":null,"confidence":0.97}]
                """);
        when(transactionService.createAll(any(), anyList())).thenReturn(java.util.List.of(saved));

        CsvImportResultDto result = transactionImportService.importCsv("user@example.com", file);

        assertEquals(1, result.totalRows());
        assertEquals(1, result.importedRows());
        assertEquals(0, result.failedRows());
        assertTrue(result.results().getFirst().imported());
        assertEquals("Success", result.results().getFirst().message());
        verify(transactionService).createAll(any(), anyList());
    }

    @Test
    void importCsv_marksRowFailedWhenAiReturnsMultipleTransactions() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "transactions.csv",
                "text/csv",
                "2022-01-02,Gas Station,60.0".getBytes()
        );

        when(aiClientService.extractFinancialEntitiesBatch(anyList())).thenReturn("""
                [
                  {"amount":60.0,"currency":"USD","date":"2022-01-02","merchant":"Gas Station","category":"Fuel","note":null,"confidence":0.97},
                  {"amount":10.0,"currency":"USD","date":"2022-01-02","merchant":"Coffee","category":"Food","note":null,"confidence":0.72}
                ]
                """);

        CsvImportResultDto result = transactionImportService.importCsv("user@example.com", file);

        assertEquals(1, result.failedRows());
        assertFalse(result.results().getFirst().imported());
        assertEquals("AI returned multiple transactions for one CSV row", result.results().getFirst().message());
    }

    @Test
    void importCsv_marksRowFailedWhenAmountIsInvalid() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "transactions.csv",
                "text/csv",
                "2022-01-02,Gas Station,not-a-number".getBytes()
        );
        when(aiClientService.extractFinancialEntitiesBatch(anyList())).thenReturn("""
                [{"amount":null,"currency":"USD","date":"2022-01-02","merchant":"Gas Station","category":"Auto & transport","note":null,"confidence":0.97}]
                """);

        CsvImportResultDto result = transactionImportService.importCsv("user@example.com", file);

        assertEquals(1, result.failedRows());
        assertEquals("AI returned null amount", result.results().getFirst().message());
    }

    @Test
    void importText_savesValidTransaction() {
        TextExtractRequest request = new TextExtractRequest();
        request.setText("I spent 60 dollars at Gas Station today");
        Transaction saved = new Transaction("Gas Station", new BigDecimal("60.0"),
                LocalDate.of(2022, 1, 2), "Auto & transport", null);

        when(aiClientService.extractFinancialEntities(any())).thenReturn("""
                [{"amount":60.0,"currency":"USD","date":"2022-01-02","merchant":"Gas Station","category":"Auto & transport","note":null,"confidence":0.97}]
                """);
        when(transactionService.create(any(), any(Transaction.class))).thenReturn(saved);

        Transaction result = transactionImportService.importText("user@example.com", request);

        assertEquals("Gas Station", result.getMerchantName());
        verify(transactionService).create(any(), any(Transaction.class));
    }

    @Test
    void importText_rejectsBlankText() {
        TextExtractRequest request = new TextExtractRequest();
        request.setText("   ");

        assertThrows(RuntimeException.class, () -> transactionImportService.importText("user@example.com", request));
    }

    @Test
    void importCsv_fallsBackToSingleRowWhenBatchResponseIsMisaligned() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "transactions.csv",
                "text/csv",
                "2022-01-02,Gas Station,60.0\n2022-01-03,Coffee Shop,8.5".getBytes()
        );
        Transaction savedOne = new Transaction("Gas Station", new BigDecimal("60.0"),
                LocalDate.of(2022, 1, 2), "Auto & transport", null);
        Transaction savedTwo = new Transaction("Coffee Shop", new BigDecimal("8.5"),
                LocalDate.of(2022, 1, 3), "Drinks & dining", null);

        when(aiClientService.extractFinancialEntitiesBatch(anyList())).thenReturn("""
                [{"amount":60.0,"currency":"USD","date":"2022-01-02","merchant":"Gas Station","category":"Auto & transport","note":null,"confidence":0.97}]
                """);
        when(aiClientService.extractFinancialEntities(any()))
                .thenReturn("""
                [{"amount":60.0,"currency":"USD","date":"2022-01-02","merchant":"Gas Station","category":"Auto & transport","note":null,"confidence":0.97}]
                """)
                .thenReturn("""
                [{"amount":8.5,"currency":"USD","date":"2022-01-03","merchant":"Coffee Shop","category":"Drinks & dining","note":null,"confidence":0.92}]
                """);
        when(transactionService.create(any(), any(Transaction.class)))
                .thenReturn(savedOne)
                .thenReturn(savedTwo);

        CsvImportResultDto result = transactionImportService.importCsv("user@example.com", file);

        assertEquals(2, result.importedRows());
        assertEquals("Success", result.results().get(0).message());
        assertEquals("Success", result.results().get(1).message());
        verify(transactionService, times(2)).create(any(), any(Transaction.class));
    }
}
