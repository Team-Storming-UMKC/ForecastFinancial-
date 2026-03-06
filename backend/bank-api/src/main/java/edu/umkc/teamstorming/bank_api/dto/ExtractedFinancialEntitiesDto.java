package edu.umkc.teamstorming.bank_api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ExtractedFinancialEntitiesDto(
        Double amount,
        String currency,
        String date,
        String merchant,
        String category,
        String note,
        Double confidence
) {}
