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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        Map<YearMonth, BigDecimal> spendingByMonth = transactionRepository.findByUserId(user.getId()).stream()
                .filter(transaction -> transaction.getDate() != null && transaction.getAmount() != null)
                .collect(Collectors.groupingBy(
                        transaction -> YearMonth.from(transaction.getDate()),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                transaction -> transaction.getAmount().abs(),
                                BigDecimal::add
                        )
                ));

        BigDecimal monthlySpending = spendingByMonth.getOrDefault(currentMonth, BigDecimal.ZERO);
        BigDecimal averageMonthlySpending = calculateAverageMonthlySpending(spendingByMonth, currentMonth, monthlySpending);
        BigDecimal spendingRatio = calculateSpendingRatio(monthlySpending, averageMonthlySpending);

        return new SpendingForecastResponse(
                determineForecastTrend(spendingRatio),
                money(monthlySpending),
                money(averageMonthlySpending),
                spendingRatio
        );
    }

    private BigDecimal calculateAverageMonthlySpending(Map<YearMonth, BigDecimal> spendingByMonth,
                                                       YearMonth currentMonth,
                                                       BigDecimal monthlySpending) {
        List<BigDecimal> priorMonthlySpending = spendingByMonth.entrySet().stream()
                .filter(entry -> entry.getKey().isBefore(currentMonth))
                .map(Map.Entry::getValue)
                .toList();

        if (priorMonthlySpending.isEmpty()) {
            return monthlySpending;
        }

        BigDecimal total = priorMonthlySpending.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(priorMonthlySpending.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateSpendingRatio(BigDecimal monthlySpending, BigDecimal averageMonthlySpending) {
        if (averageMonthlySpending.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return monthlySpending.divide(averageMonthlySpending, 2, RoundingMode.HALF_UP);
    }

    private String determineForecastTrend(BigDecimal spendingRatio) {
        if (spendingRatio.compareTo(SUNNY_LIMIT) < 0) {
            return "sunny";
        }
        if (spendingRatio.compareTo(CLOUDY_LIMIT) <= 0) {
            return "cloudy";
        }
        if (spendingRatio.compareTo(RAINING_LIMIT) <= 0) {
            return "raining";
        }
        return "thunderstorm";
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
