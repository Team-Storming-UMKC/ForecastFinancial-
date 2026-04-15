package edu.umkc.teamstorming.bank_api.transaction;

import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

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

    public List<Transaction> list(String email) {
        User user = getUserByEmail(email);
        return transactionRepository.findByUserId(user.getId());
    }

    public Transaction create(String email, Transaction incoming) {
        User user = getUserByEmail(email);

        // never trust client for user ownership
        incoming.setUser(user);

        // optional: ignore incoming id if provided
        // incoming.setId(null); // only if you add a setter or use DTOs

        return transactionRepository.save(incoming);
    }

    public Transaction update(String email, Long txId, Transaction incoming) {
        User user = getUserByEmail(email);

        Transaction existing = transactionRepository.findByIdAndUserId(txId, user.getId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // update allowed fields
        existing.setMerchantName(incoming.getMerchantName());
        existing.setAmount(incoming.getAmount());
        existing.setDate(incoming.getDate());
        existing.setCategory(incoming.getCategory());

        return transactionRepository.save(existing);
    }

    public void delete(String email, Long txId) {
        User user = getUserByEmail(email);

        Transaction existing = transactionRepository.findByIdAndUserId(txId, user.getId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transactionRepository.delete(existing);
    }

    @Transactional
    public void deleteAll(String email) {
        User user = getUserByEmail(email);
        transactionRepository.deleteByUserId(user.getId());
    }
}
