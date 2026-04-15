package edu.umkc.teamstorming.bank_api.transaction_test;

import edu.umkc.teamstorming.bank_api.ai.AiClientService;
import edu.umkc.teamstorming.bank_api.ai.LmStudioParser;
import edu.umkc.teamstorming.bank_api.dto.CsvImportResultDto;
import edu.umkc.teamstorming.bank_api.dto.ExtractedFinancialEntitiesDto;
import edu.umkc.teamstorming.bank_api.transaction.Transaction;
import edu.umkc.teamstorming.bank_api.transaction.TransactionImportService;
import edu.umkc.teamstorming.bank_api.transaction.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CsvImportFormattingTest {

    private AiClientService aiClientService;
    private LmStudioParser lmStudioParser;
    private TransactionService transactionService;
    private TransactionImportService transactionImportService;

    @BeforeEach
    void setUp() {
        aiClientService = mock(AiClientService.class);
        lmStudioParser = mock(LmStudioParser.class);
        transactionService = mock(TransactionService.class);
        transactionImportService = new TransactionImportService(aiClientService, lmStudioParser, transactionService);
    }

    @Test
    @SuppressWarnings("unchecked")
    void importCsv_formatsMerchantNameOnlyForCsvImports() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "transactions.csv",
                "text/csv",
                "date,merchant,amount,category\n2026-04-13,starbucks   coffee,6.25,Groceries".getBytes()
        );
        ExtractedFinancialEntitiesDto extracted = new ExtractedFinancialEntitiesDto(
                6.25,
                "USD",
                "2026-04-13",
                "  starbucks   coffee  ",
                " Groceries ",
                null,
                0.95
        );

        when(aiClientService.extractFinancialEntitiesBatch(anyList())).thenReturn("[]");
        when(lmStudioParser.readEntitiesJsonList("[]")).thenReturn(List.of(extracted));
        when(transactionService.createAll(eq("user@example.com"), anyList()))
                .thenAnswer(invocation -> invocation.getArgument(1));

        CsvImportResultDto result = transactionImportService.importCsv("user@example.com", file);

        ArgumentCaptor<List<Transaction>> transactionsCaptor = ArgumentCaptor.forClass(List.class);
        verify(transactionService).createAll(eq("user@example.com"), transactionsCaptor.capture());
        Transaction savedTransaction = transactionsCaptor.getValue().getFirst();

        assertEquals(1, result.importedRows());
        assertEquals("STARBUCKS COFFEE", savedTransaction.getMerchantName());
        assertEquals("Groceries", savedTransaction.getCategory());
    }
}
