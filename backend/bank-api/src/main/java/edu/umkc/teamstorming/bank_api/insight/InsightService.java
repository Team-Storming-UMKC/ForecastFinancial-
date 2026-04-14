package edu.umkc.teamstorming.bank_api.insight;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.umkc.teamstorming.bank_api.ai.AiClientService;
import edu.umkc.teamstorming.bank_api.ai.LmStudioParser;
import edu.umkc.teamstorming.bank_api.transaction.CategorySpendingSummary;
import edu.umkc.teamstorming.bank_api.transaction.TransactionRepository;
import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class InsightService {

    private static final int LOOKBACK_DAYS = 90;

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AiClientService aiClientService;
    private final LmStudioParser lmStudioParser;
    private final ObjectMapper objectMapper;

    public InsightService(TransactionRepository transactionRepository,
                          UserRepository userRepository,
                          AiClientService aiClientService,
                          LmStudioParser lmStudioParser,
                          ObjectMapper objectMapper) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.aiClientService = aiClientService;
        this.lmStudioParser = lmStudioParser;
        this.objectMapper = objectMapper;
    }

    public List<String> getExpenseCuttingInsights(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatusCode.valueOf(404), "User not found"));

        LocalDate startDate = LocalDate.now().minusDays(LOOKBACK_DAYS);
        List<CategorySpendingSummary> categorySpending =
                transactionRepository.findSpendingByCategorySince(user.getId(), startDate);

        String promptData = buildPromptData(user, startDate, categorySpending);
        String aiJsonContent = aiClientService.generateExpenseCuttingInsights(promptData);
        try {
            return lmStudioParser.readThreeStringArray(aiJsonContent);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatusCode.valueOf(502),
                    "AI returned invalid insights JSON. Expected exactly a JSON array of 3 strings.",
                    e
            );
        }
    }

    private String buildPromptData(User user, LocalDate startDate, List<CategorySpendingSummary> categorySpending) {
        List<Map<String, Object>> spending = categorySpending.stream()
                .map(summary -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("category", summary.getCategory());
                    row.put("totalSpent", summary.getTotalSpent());
                    row.put("transactionCount", summary.getTransactionCount());
                    return row;
                })
                .toList();

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("firstName", user.getFirstName());
        profile.put("dateOfBirth", user.getDateOfBirth() == null ? null : user.getDateOfBirth().toString());
        profile.put("createdAt", user.getCreatedAt() == null ? null : user.getCreatedAt().toString());

        Map<String, Object> spendingWindow = new LinkedHashMap<>();
        spendingWindow.put("days", LOOKBACK_DAYS);
        spendingWindow.put("startDate", startDate.toString());
        spendingWindow.put("endDate", LocalDate.now().toString());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("profile", profile);
        payload.put("spendingWindow", spendingWindow);
        payload.put("spendingByCategory", spending);

        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(500), "Failed to serialize insight prompt data", e);
        }
    }
}
