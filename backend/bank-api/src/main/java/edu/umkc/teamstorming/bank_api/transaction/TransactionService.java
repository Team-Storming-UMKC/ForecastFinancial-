package edu.umkc.teamstorming.bank_api.transaction;

import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void validate(Transaction t) {
        // Block future dates
        if (t.getDate() != null && t.getDate().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Transaction date cannot be in the future.");
        }

        // Block income from being counted as spending by ensuring income is positive
        // and spending is negative — if category is Income but amount is negative, reject it
        if (t.getCategory() != null
                && t.getCategory().equalsIgnoreCase("Income")
                && t.getAmount() != null
                && t.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Income transactions must have a positive amount.");
        }
    }

    public List<Transaction> list(String email) {
        User user = getUserByEmail(email);
        return transactionRepository.findByUserId(user.getId());
    }

    public Transaction create(String email, Transaction incoming) {
        User user = getUserByEmail(email);
        incoming.setUser(user);
        validate(incoming);
        return transactionRepository.save(incoming);
    }

    public Transaction update(String email, Long txId, Transaction incoming) {
        User user = getUserByEmail(email);

        Transaction existing = transactionRepository.findByIdAndUserId(txId, user.getId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        existing.setMerchantName(incoming.getMerchantName());
        existing.setAmount(incoming.getAmount());
        existing.setDate(incoming.getDate());
        existing.setCategory(incoming.getCategory());

        validate(existing);
        return transactionRepository.save(existing);
    }

    public void delete(String email, Long txId) {
        User user = getUserByEmail(email);

        Transaction existing = transactionRepository.findByIdAndUserId(txId, user.getId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transactionRepository.delete(existing);
    }
}