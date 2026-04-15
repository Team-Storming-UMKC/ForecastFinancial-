package edu.umkc.teamstorming.bank_api.transaction;

import edu.umkc.teamstorming.bank_api.dto.CsvImportResultDto;
import edu.umkc.teamstorming.bank_api.dto.TextExtractRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final TransactionImportService transactionImportService;

    public TransactionController(TransactionService transactionService,
                                 TransactionImportService transactionImportService) {
        this.transactionService = transactionService;
        this.transactionImportService = transactionImportService;
    }

    @GetMapping
    public List<Transaction> list(Authentication auth) {
        return transactionService.list(auth.getName());
    }

    @PostMapping
    public Transaction create(@RequestBody Transaction transaction, Authentication auth) {
        return transactionService.create(auth.getName(), transaction);
    }

    @PostMapping("/import-csv")
    public CsvImportResultDto importCsv(@RequestParam("file") MultipartFile file, Authentication auth) {
        return transactionImportService.importCsv(auth.getName(), file);
    }

    @PostMapping("/from-text")
    public Transaction createFromText(@RequestBody TextExtractRequest request, Authentication auth) {
        return transactionImportService.importText(auth.getName(), request);
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
