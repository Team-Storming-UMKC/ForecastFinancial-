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
import static org.junit.jupiter.api.Assertions.assertNull;
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
    void getSpendingForecast_returnsRainingWhenCurrentSpendingIsAboveIncome() {
        YearMonth currentMonth = YearMonth.now();
        when(transactionRepository.findByUserId(user.getId())).thenReturn(List.of(
                transaction("Current Grocery", "-3200.00", currentMonth.atDay(5)),
                transaction("Paycheck", "2800.00", currentMonth.atDay(10))
        ));

        SpendingForecastResponse result = spendingForecastService.getSpendingForecast("user@example.com");

        assertEquals("raining", result.forecastTrend());
        assertEquals(new BigDecimal("3200.00"), result.monthlySpending());
        assertEquals(new BigDecimal("2800.00"), result.monthlyIncome());
        assertEquals(new BigDecimal("1.14"), result.spendingToIncomeRatio());
    }

    @Test
    void getSpendingForecast_returnsSunnyWhenCurrentSpendingIsUnderEightyPercentOfIncome() {
        YearMonth currentMonth = YearMonth.now();
        when(transactionRepository.findByUserId(user.getId())).thenReturn(List.of(
                transaction("Current", "-700.00", currentMonth.atDay(1)),
                transaction("Paycheck", "1000.00", currentMonth.atDay(3))
        ));

        SpendingForecastResponse result = spendingForecastService.getSpendingForecast("user@example.com");

        assertEquals("sunny", result.forecastTrend());
        assertEquals(new BigDecimal("0.70"), result.spendingToIncomeRatio());
    }

    @Test
    void getSpendingForecast_returnsThunderstormWhenCurrentSpendingIsOverOneHundredTwentyFivePercentOfIncome() {
        YearMonth currentMonth = YearMonth.now();
        when(transactionRepository.findByUserId(user.getId())).thenReturn(List.of(
                transaction("Current", "-1300.00", currentMonth.atDay(1)),
                transaction("Paycheck", "1000.00", currentMonth.atDay(4))
        ));

        SpendingForecastResponse result = spendingForecastService.getSpendingForecast("user@example.com");

        assertEquals("thunderstorm", result.forecastTrend());
        assertEquals(new BigDecimal("1.30"), result.spendingToIncomeRatio());
    }

    @Test
    void getSpendingForecast_returnsCloudyWhenSpendingMatchesIncome() {
        YearMonth currentMonth = YearMonth.now();
        when(transactionRepository.findByUserId(user.getId())).thenReturn(List.of(
                transaction("Current", "-50.00", currentMonth.atDay(1)),
                transaction("Income", "50.00", currentMonth.atDay(2))
        ));

        SpendingForecastResponse result = spendingForecastService.getSpendingForecast("user@example.com");

        assertEquals("cloudy", result.forecastTrend());
        assertEquals(new BigDecimal("50.00"), result.monthlySpending());
        assertEquals(new BigDecimal("50.00"), result.monthlyIncome());
        assertEquals(new BigDecimal("1.00"), result.spendingToIncomeRatio());
    }

    @Test
    void getSpendingForecast_ignoresPriorMonthsWhenComparingSpendingToIncome() {
        YearMonth currentMonth = YearMonth.now();
        when(transactionRepository.findByUserId(user.getId())).thenReturn(List.of(
                transaction("Current Income", "1000.00", currentMonth.atDay(1)),
                transaction("Current Groceries", "-700.00", currentMonth.atDay(2)),
                transaction("Previous Income", "500.00", currentMonth.minusMonths(1).atDay(1)),
                transaction("Previous Rent", "-2000.00", currentMonth.minusMonths(1).atDay(2))
        ));

        SpendingForecastResponse result = spendingForecastService.getSpendingForecast("user@example.com");

        assertEquals("sunny", result.forecastTrend());
        assertEquals(new BigDecimal("700.00"), result.monthlySpending());
        assertEquals(new BigDecimal("1000.00"), result.monthlyIncome());
        assertEquals(new BigDecimal("0.70"), result.spendingToIncomeRatio());
    }

    @Test
    void getSpendingForecast_returnsThunderstormWhenThereIsSpendingButNoIncome() {
        YearMonth currentMonth = YearMonth.now();
        when(transactionRepository.findByUserId(user.getId())).thenReturn(List.of(
                transaction("Current Groceries", "-700.00", currentMonth.atDay(2))
        ));

        SpendingForecastResponse result = spendingForecastService.getSpendingForecast("user@example.com");

        assertEquals("thunderstorm", result.forecastTrend());
        assertEquals(new BigDecimal("700.00"), result.monthlySpending());
        assertEquals(new BigDecimal("0.00"), result.monthlyIncome());
        assertNull(result.spendingToIncomeRatio());
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
