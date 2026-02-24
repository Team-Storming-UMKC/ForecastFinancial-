package edu.umkc.teamstorming.bank_api.transaction;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public List<Transaction> getTransactions(Authentication authentication) {
        String email = authentication.getName();
        return transactionService.getUserTransactions(email);
    }

    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction,
                                         Authentication authentication) {
        String email = authentication.getName();
        return transactionService.createTransaction(transaction, email);
    }
}
