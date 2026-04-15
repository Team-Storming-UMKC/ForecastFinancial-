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
    public List<Transaction> list(Authentication auth) {
        return transactionService.list(auth.getName());
    }

    @PostMapping
    public Transaction create(@RequestBody Transaction transaction, Authentication auth) {
        return transactionService.create(auth.getName(), transaction);
    }

    @PutMapping("/{id}")
    public Transaction update(@PathVariable Long id,
                              @RequestBody Transaction transaction,
                              Authentication auth) {
        return transactionService.update(auth.getName(), id, transaction);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication auth) {
        transactionService.delete(auth.getName(), id);
    }

    @DeleteMapping
    public void deleteAll(Authentication auth) {
        transactionService.deleteAll(auth.getName());
    }
}
