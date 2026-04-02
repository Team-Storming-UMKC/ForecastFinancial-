package edu.umkc.teamstorming.bank_api.transaction;

import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class transaction_service_test {

    private TransactionService transactionService;
    private TransactionRepository transactionRepository;
    private UserRepository userRepository;

    private User mockUser;

    @BeforeEach
    void setUp() {
        transactionRepository = Mockito.mock(TransactionRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        transactionService = new TransactionService(transactionRepository, userRepository);

        mockUser = new User("Test", "User", "user@example.com", "hashedpassword", LocalDate.of(2000, 1, 1));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
    }

    // ─── LIST TESTS ───────────────────────────────────────────────

    @Test
    void list_returnsTransactionsForUser() {
        Transaction t1 = new Transaction("Amazon", new BigDecimal("49.99"), LocalDate.now(), "Shopping", mockUser);
        Transaction t2 = new Transaction("Starbucks", new BigDecimal("6.75"), LocalDate.now(), "Food", mockUser);

        when(transactionRepository.findByUserId(mockUser.getId())).thenReturn(List.of(t1, t2));

        List<Transaction> result = transactionService.list("user@example.com");

        assertEquals(2, result.size());
        assertEquals("Amazon", result.get(0).getMerchantName());
        assertEquals("Starbucks", result.get(1).getMerchantName());
    }

    @Test
    void list_userNotFound_throwsException() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> transactionService.list("ghost@example.com"));
    }

    @Test
    void list_returnsEmptyListWhenNoTransactions() {
        when(transactionRepository.findByUserId(mockUser.getId())).thenReturn(List.of());

        List<Transaction> result = transactionService.list("user@example.com");

        assertTrue(result.isEmpty());
    }

    // ─── CREATE TESTS ─────────────────────────────────────────────

    @Test
    void create_savesTransactionWithCorrectUser() {
        Transaction incoming = new Transaction("Netflix", new BigDecimal("15.99"), LocalDate.now(), "Entertainment", null);
        when(transactionRepository.save(incoming)).thenReturn(incoming);

        Transaction result = transactionService.create("user@example.com", incoming);

        assertEquals(mockUser, result.getUser());
        verify(transactionRepository).save(incoming);
    }

    @Test
    void create_amountIsCorrectlyStored() {
        Transaction incoming = new Transaction("Walmart", new BigDecimal("123.45"), LocalDate.now(), "Shopping", null);
        when(transactionRepository.save(incoming)).thenReturn(incoming);

        Transaction result = transactionService.create("user@example.com", incoming);

        assertEquals(new BigDecimal("123.45"), result.getAmount());
    }

    @Test
    void create_userNotFound_throwsException() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        Transaction incoming = new Transaction("Amazon", new BigDecimal("10.00"), LocalDate.now(), "Shopping", null);

        assertThrows(RuntimeException.class, () -> transactionService.create("ghost@example.com", incoming));
    }

    @Test
    void create_overridesClientProvidedUser() {
        User fakeUser = new User("Fake", "User", "hacker@example.com", "hash", LocalDate.of(2000, 1, 1));
        Transaction incoming = new Transaction("Amazon", new BigDecimal("10.00"), LocalDate.now(), "Shopping", fakeUser);
        when(transactionRepository.save(incoming)).thenReturn(incoming);

        Transaction result = transactionService.create("user@example.com", incoming);

        // Should always be the authenticated user, not whoever the client sent
        assertEquals(mockUser, result.getUser());
    }

    // ─── UPDATE TESTS ─────────────────────────────────────────────

    @Test
    void update_updatesFieldsCorrectly() {
        Transaction existing = new Transaction("OldName", new BigDecimal("10.00"), LocalDate.now(), "OldCategory", mockUser);
        when(transactionRepository.findByIdAndUserId(1L, mockUser.getId())).thenReturn(Optional.of(existing));
        when(transactionRepository.save(existing)).thenReturn(existing);

        Transaction incoming = new Transaction("NewName", new BigDecimal("99.99"), LocalDate.of(2026, 3, 1), "NewCategory", null);
        Transaction result = transactionService.update("user@example.com", 1L, incoming);

        assertEquals("NewName", result.getMerchantName());
        assertEquals(new BigDecimal("99.99"), result.getAmount());
        assertEquals(LocalDate.of(2026, 3, 1), result.getDate());
        assertEquals("NewCategory", result.getCategory());
    }

    @Test
    void update_transactionNotFound_throwsException() {
        when(transactionRepository.findByIdAndUserId(99L, mockUser.getId())).thenReturn(Optional.empty());

        Transaction incoming = new Transaction("Name", new BigDecimal("10.00"), LocalDate.now(), "Category", null);

        assertThrows(RuntimeException.class, () -> transactionService.update("user@example.com", 99L, incoming));
    }

    @Test
    void update_userNotFound_throwsException() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        Transaction incoming = new Transaction("Name", new BigDecimal("10.00"), LocalDate.now(), "Category", null);

        assertThrows(RuntimeException.class, () -> transactionService.update("ghost@example.com", 1L, incoming));
    }

    // ─── DELETE TESTS ─────────────────────────────────────────────

    @Test
    void delete_deletesTransactionSuccessfully() {
        Transaction existing = new Transaction("Amazon", new BigDecimal("49.99"), LocalDate.now(), "Shopping", mockUser);
        when(transactionRepository.findByIdAndUserId(1L, mockUser.getId())).thenReturn(Optional.of(existing));

        transactionService.delete("user@example.com", 1L);

        verify(transactionRepository).delete(existing);
    }

    @Test
    void delete_transactionNotFound_throwsException() {
        when(transactionRepository.findByIdAndUserId(99L, mockUser.getId())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> transactionService.delete("user@example.com", 99L));
    }

    @Test
    void delete_userNotFound_throwsException() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> transactionService.delete("ghost@example.com", 1L));
    }
}
