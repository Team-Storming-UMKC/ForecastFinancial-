package edu.umkc.teamstorming.bank_api.insight;

import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
public class InsightController {

    private final InsightService insightService;

    public InsightController(InsightService insightService) {
        this.insightService = insightService;
    }

    @GetMapping
    public List<String> getInsights(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(401), "Unauthorized");
        }
        return insightService.getExpenseCuttingInsights(auth.getName());
    }
}
