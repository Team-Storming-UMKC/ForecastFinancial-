package edu.umkc.teamstorming.bank_api.subscription;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PredictedSubscriptionDto(
        String merchantName,
        BigDecimal expectedAmount,
        LocalDate predictedNextChargeDate
) {
}
