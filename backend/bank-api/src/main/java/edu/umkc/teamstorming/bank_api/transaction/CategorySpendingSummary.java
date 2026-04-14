package edu.umkc.teamstorming.bank_api.transaction;

import java.math.BigDecimal;

public interface CategorySpendingSummary {
    String getCategory();
    BigDecimal getTotalSpent();
    Long getTransactionCount();
}
