package edu.umkc.teamstorming.bank_api.forecast;

import java.math.BigDecimal;

public record SpendingForecastResponse(
        String forecastTrend,
        BigDecimal monthlySpending,
        BigDecimal averageMonthlySpending,
        BigDecimal spendingRatio
) {
}
