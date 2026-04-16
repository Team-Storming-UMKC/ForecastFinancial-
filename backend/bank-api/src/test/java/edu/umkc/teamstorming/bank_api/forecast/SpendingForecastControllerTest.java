package edu.umkc.teamstorming.bank_api.forecast;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SpendingForecastControllerTest {

    private SpendingForecastController spendingForecastController;
    private SpendingForecastService spendingForecastService;
    private Authentication auth;

    @BeforeEach
    void setUp() {
        spendingForecastService = Mockito.mock(SpendingForecastService.class);
        spendingForecastController = new SpendingForecastController(spendingForecastService);
        auth = Mockito.mock(Authentication.class);
        when(auth.getName()).thenReturn("user@example.com");
    }

    @Test
    void getSpendingForecast_returnsForecastForAuthenticatedUser() {
        SpendingForecastResponse forecast = new SpendingForecastResponse(
                "raining",
                new BigDecimal("3200.00"),
                new BigDecimal("2800.00"),
                new BigDecimal("1.14")
        );
        when(spendingForecastService.getSpendingForecast("user@example.com")).thenReturn(forecast);

        SpendingForecastResponse result = spendingForecastController.getSpendingForecast(auth);

        assertEquals("raining", result.forecastTrend());
        verify(spendingForecastService).getSpendingForecast("user@example.com");
    }

    @Test
    void getSpendingForecast_nullAuthenticationThrowsUnauthorized() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> spendingForecastController.getSpendingForecast(null)
        );

        assertEquals(401, exception.getStatusCode().value());
    }
}
