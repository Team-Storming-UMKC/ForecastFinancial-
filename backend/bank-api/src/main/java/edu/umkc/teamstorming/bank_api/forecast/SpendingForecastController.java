package edu.umkc.teamstorming.bank_api.forecast;

import org.springframework.http.HttpStatusCode;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/forecast")
public class SpendingForecastController {

    private final SpendingForecastService spendingForecastService;

    public SpendingForecastController(SpendingForecastService spendingForecastService) {
        this.spendingForecastService = spendingForecastService;
    }

    @GetMapping("/spending")
    public SpendingForecastResponse getSpendingForecast(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(401), "Unauthorized");
        }
        return spendingForecastService.getSpendingForecast(auth.getName());
    }
}
