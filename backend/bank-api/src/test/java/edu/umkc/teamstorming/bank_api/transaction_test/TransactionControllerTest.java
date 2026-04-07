package edu.umkc.teamstorming.bank_api.transaction_test;
import edu.umkc.teamstorming.bank_api.dto.CsvImportResultDto;
import edu.umkc.teamstorming.bank_api.dto.CsvImportRowResultDto;
import edu.umkc.teamstorming.bank_api.transaction.Transaction;
import edu.umkc.teamstorming.bank_api.transaction.TransactionController;
import edu.umkc.teamstorming.bank_api.transaction.TransactionImportService;
import edu.umkc.teamstorming.bank_api.transaction.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.Authentication;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TransactionControllerTest {

    private TransactionController transactionController;
    private TransactionService transactionService;
    private TransactionImportService transactionImportService;
    private Authentication auth;

    @BeforeEach
    void setUp() {
        transactionService = Mockito.mock(TransactionService.class);
        transactionImportService = Mockito.mock(TransactionImportService.class);
        transactionController = new TransactionController(transactionService, transactionImportService);
        auth = Mockito.mock(Authentication.class);
        when(auth.getName()).thenReturn("user@example.com");
    }

    // ─── LIST TESTS ───────────────────────────────────────────────

    @Test
    void list_returnsTransactionsFromService() {
        Transaction t1 = new Transaction("Amazon", new BigDecimal("49.99"), LocalDate.now(), "Shopping", null);
        Transaction t2 = new Transaction("Starbucks", new BigDecimal("6.75"), LocalDate.now(), "Food", null);
        when(transactionService.list("user@example.com")).thenReturn(List.of(t1, t2));

        List<Transaction> result = transactionController.list(auth);

        assertEquals(2, result.size());
        verify(transactionService).list("user@example.com");
    }

    @Test
    void list_returnsEmptyList() {
        when(transactionService.list("user@example.com")).thenReturn(List.of());

        List<Transaction> result = transactionController.list(auth);

        assertTrue(result.isEmpty());
    }

    // ─── CREATE TESTS ─────────────────────────────────────────────

    @Test
    void create_returnsCreatedTransaction() {
        Transaction incoming = new Transaction("Netflix", new BigDecimal("15.99"), LocalDate.now(), "Entertainment", null);
        when(transactionService.create("user@example.com", incoming)).thenReturn(incoming);

        Transaction result = transactionController.create(incoming, auth);

        assertEquals("Netflix", result.getMerchantName());
        assertEquals(new BigDecimal("15.99"), result.getAmount());
        verify(transactionService).create("user@example.com", incoming);
    }

    @Test
    void importCsv_returnsImportSummary() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "transactions.csv",
                "text/csv",
                "date,merchant,amount\n2022-01-02,Gas Station,60.0".getBytes()
        );
        CsvImportResultDto resultDto = new CsvImportResultDto(
                1,
                1,
                0,
                List.of(new CsvImportRowResultDto(2, "2022-01-02,Gas Station,60.0", true, "Imported", null))
        );
        when(transactionImportService.importCsv("user@example.com", file)).thenReturn(resultDto);

        CsvImportResultDto result = transactionController.importCsv(file, auth);

        assertEquals(1, result.totalRows());
        assertEquals(1, result.importedRows());
        verify(transactionImportService).importCsv("user@example.com", file);
    }

    // ─── UPDATE TESTS ─────────────────────────────────────────────

    @Test
    void update_returnsUpdatedTransaction() {
        Transaction incoming = new Transaction("Walmart", new BigDecimal("25.00"), LocalDate.now(), "Groceries", null);
        when(transactionService.update("user@example.com", 1L, incoming)).thenReturn(incoming);

        Transaction result = transactionController.update(1L, incoming, auth);

        assertEquals("Walmart", result.getMerchantName());
        verify(transactionService).update("user@example.com", 1L, incoming);
    }

    // ─── DELETE TESTS ─────────────────────────────────────────────

    @Test
    void delete_callsServiceWithCorrectArgs() {
        transactionController.delete(1L, auth);

        verify(transactionService).delete("user@example.com", 1L);
    }
}
