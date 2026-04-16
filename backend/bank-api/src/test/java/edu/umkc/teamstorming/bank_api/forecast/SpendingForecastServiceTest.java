package edu.umkc.teamstorming.bank_api.forecast;

import edu.umkc.teamstorming.bank_api.transaction.Transaction;
import edu.umkc.teamstorming.bank_api.transaction.TransactionRepository;
import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

class SpendingForecastServiceTest {

    private SpendingForecastService spendingForecastService;
    private TransactionRepository transactionRepository;
    private UserRepository userRepository;
    private User user;

    @BeforeEach
    void setUp() {
        transactionRepository = Mockito.mock(TransactionRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        spendingForecastService = new SpendingForecastService(transactionRepository, userRepository);

        user = new User("Test", "User", "user@example.com", "hashedpassword", LocalDate.of(2000, 1, 1));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
    }

    @Test
    void getSpendingForecast_returnsRainingWhenCurrentSpendingIsAboveAverage() {
        YearMonth currentMonth = YearMonth.now();
        when(transactionRepository.findByUserId(user.getId())).thenReturn(List.of(
                transaction("Current Grocery", "3200.00", currentMonth.atDay(5)),
                transaction("Last Month", "2800.00", currentMonth.minusMonths(1).atDay(5))
        ));

        SpendingForecastResponse result = spendingForecastService.getSpendingForecast("user@example.com");

        assertEquals("raining", result.forecastTrend());
        assertEquals(new BigDecimal("3200.00"), result.monthlySpending());
        assertEquals(new BigDecimal("2800.00"), result.averageMonthlySpending());
        assertEquals(new BigDecimal("1.14"), result.spendingRatio());
    }

    @Test
    void getSpendingForecast_returnsSunnyWhenCurrentSpendingIsUnderEightyPercentOfAverage() {
        YearMonth currentMonth = YearMonth.now();
        when(transactionRepository.findByUserId(user.getId())).thenReturn(List.of(
                transaction("Current", "700.00", currentMonth.atDay(1)),
                transaction("Previous", "1000.00", currentMonth.minusMonths(1).atDay(1))
        ));

        SpendingForecastResponse result = spendingForecastService.getSpendingForecast("user@example.com");

        assertEquals("sunny", result.forecastTrend());
        assertEquals(new BigDecimal("0.70"), result.spendingRatio());
    }

    @Test
    void getSpendingForecast_returnsThunderstormWhenCurrentSpendingIsOverOneHundredTwentyFivePercentOfAverage() {
        YearMonth currentMonth = YearMonth.now();
        when(transactionRepository.findByUserId(user.getId())).thenReturn(List.of(
                transaction("Current", "1300.00", currentMonth.atDay(1)),
                transaction("Previous", "1000.00", currentMonth.minusMonths(1).atDay(1))
        ));

        SpendingForecastResponse result = spendingForecastService.getSpendingForecast("user@example.com");

        assertEquals("thunderstorm", result.forecastTrend());
        assertEquals(new BigDecimal("1.30"), result.spendingRatio());
    }

    @Test
    void getSpendingForecast_usesCurrentMonthAsAverageWhenNoPriorHistoryExists() {
        YearMonth currentMonth = YearMonth.now();
        when(transactionRepository.findByUserId(user.getId())).thenReturn(List.of(
                transaction("Current", "50.00", currentMonth.atDay(1))
        ));

        SpendingForecastResponse result = spendingForecastService.getSpendingForecast("user@example.com");

        assertEquals("cloudy", result.forecastTrend());
        assertEquals(new BigDecimal("50.00"), result.monthlySpending());
        assertEquals(new BigDecimal("50.00"), result.averageMonthlySpending());
        assertEquals(new BigDecimal("1.00"), result.spendingRatio());
    }

    @Test
    void getSpendingForecast_userNotFoundThrowsNotFound() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> spendingForecastService.getSpendingForecast("ghost@example.com")
        );

        assertEquals(404, exception.getStatusCode().value());
    }

    private Transaction transaction(String merchantName, String amount, LocalDate date) {
        return new Transaction(merchantName, new BigDecimal(amount), date, "General", user);
    }
}
