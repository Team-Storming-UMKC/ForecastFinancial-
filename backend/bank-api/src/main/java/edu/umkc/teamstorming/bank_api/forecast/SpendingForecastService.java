package edu.umkc.teamstorming.bank_api.forecast;

import edu.umkc.teamstorming.bank_api.transaction.Transaction;
import edu.umkc.teamstorming.bank_api.transaction.TransactionRepository;
import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;

@Service
public class SpendingForecastService {

    private static final BigDecimal SUNNY_LIMIT = new BigDecimal("0.80");
    private static final BigDecimal CLOUDY_LIMIT = new BigDecimal("1.00");
    private static final BigDecimal RAINING_LIMIT = new BigDecimal("1.25");

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public SpendingForecastService(TransactionRepository transactionRepository,
                                   UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public SpendingForecastResponse getSpendingForecast(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatusCode.valueOf(404), "User not found"));

        YearMonth currentMonth = YearMonth.now();
        var transactions = transactionRepository.findByUserId(user.getId());
        BigDecimal monthlySpending = transactions.stream()
                .filter(transaction -> transaction.getDate() != null && transaction.getAmount() != null)
                .filter(transaction -> YearMonth.from(transaction.getDate()).equals(currentMonth))
                .filter(transaction -> transaction.getAmount().signum() < 0)
                .map(transaction -> transaction.getAmount().abs())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal monthlyIncome = transactions.stream()
                .filter(transaction -> transaction.getDate() != null && transaction.getAmount() != null)
                .filter(transaction -> YearMonth.from(transaction.getDate()).equals(currentMonth))
                .filter(transaction -> transaction.getAmount().signum() > 0)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal spendingToIncomeRatio = calculateSpendingToIncomeRatio(monthlySpending, monthlyIncome);

        return new SpendingForecastResponse(
                determineForecastTrend(monthlySpending, monthlyIncome, spendingToIncomeRatio),
                money(monthlySpending),
                money(monthlyIncome),
                spendingToIncomeRatio
        );
    }

    private BigDecimal calculateSpendingToIncomeRatio(BigDecimal monthlySpending, BigDecimal monthlyIncome) {
        if (monthlyIncome.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return monthlySpending.divide(monthlyIncome, 2, RoundingMode.HALF_UP);
    }

    private String determineForecastTrend(BigDecimal monthlySpending,
                                          BigDecimal monthlyIncome,
                                          BigDecimal spendingToIncomeRatio) {
        if (monthlyIncome.compareTo(BigDecimal.ZERO) == 0) {
            if (monthlySpending.compareTo(BigDecimal.ZERO) == 0) {
                return "cloudy";
            }
            return "thunderstorm";
        }

        if (spendingToIncomeRatio.compareTo(SUNNY_LIMIT) < 0) {
            return "sunny";
        }
        if (spendingToIncomeRatio.compareTo(CLOUDY_LIMIT) <= 0) {
            return "cloudy";
        }
        if (spendingToIncomeRatio.compareTo(RAINING_LIMIT) <= 0) {
            return "raining";
        }
        return "thunderstorm";
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
