package edu.umkc.teamstorming.bank_api.dto;

import edu.umkc.teamstorming.bank_api.transaction.Transaction;

public record CsvImportRowResultDto(
        int rowNumber,
        String rawRow,
        boolean imported,
        String message,
        Transaction transaction
) {
}
