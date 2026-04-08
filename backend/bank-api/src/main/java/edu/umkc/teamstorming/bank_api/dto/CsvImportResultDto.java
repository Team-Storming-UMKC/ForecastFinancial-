package edu.umkc.teamstorming.bank_api.dto;

import java.util.List;

public record CsvImportResultDto(
        int totalRows,
        int importedRows,
        int failedRows,
        List<CsvImportRowResultDto> results
) {
}
