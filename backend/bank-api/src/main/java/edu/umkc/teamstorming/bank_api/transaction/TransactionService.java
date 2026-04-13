package edu.umkc.teamstorming.bank_api.transaction;

import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
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
        attachUser(incoming, user);
        return transactionRepository.save(incoming);
    }

    public List<Transaction> createAll(String email, List<Transaction> incomingTransactions) {
        User user = getUserByEmail(email);
        incomingTransactions.forEach(transaction -> attachUser(transaction, user));
        return transactionRepository.saveAll(incomingTransactions);
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

    private void attachUser(Transaction transaction, User user) {
        // never trust client for user ownership
        transaction.setUser(user);
    }
}
