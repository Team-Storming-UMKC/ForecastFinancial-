package edu.umkc.teamstorming.bank_api.ai;

import edu.umkc.teamstorming.bank_api.dto.LmStudioChatRequest;
import edu.umkc.teamstorming.bank_api.dto.LmStudioChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiClientService {

    private final WebClient aiWebClient;
    private final String modelName;

    public AiClientService(
            WebClient aiWebClient,
            @Value("${lmstudio.model}") String modelName
    ) {
        this.aiWebClient = aiWebClient;
        this.modelName = modelName;
    }

    public String ping() {
        // Hardcoded test prompt
        LmStudioChatRequest req = new LmStudioChatRequest(
                modelName,
                List.of(new LmStudioChatRequest.Message("user", "Say 'pong' and nothing else.")),
                0.0,
                50
        );

        try {
            LmStudioChatResponse resp = aiWebClient.post()
                    // If your base URL already includes /v1, use "/chat/completions"
                    // If your base URL is just the tunnel domain, use "/v1/chat/completions"
                    .uri("/chat/completions")
                    .bodyValue(req)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, r ->
                            r.bodyToMono(String.class).map(body ->
                                    new ResponseStatusException(
                                            HttpStatusCode.valueOf(r.statusCode().value()),
                                            "AI error: " + body
                                    )
                            )
                    )
                    .bodyToMono(LmStudioChatResponse.class)
                    .timeout(Duration.ofSeconds(20))
                    .block();

            if (resp == null || resp.choices() == null || resp.choices().isEmpty()
                    || resp.choices().get(0).message() == null) {
                throw new ResponseStatusException(HttpStatusCode.valueOf(502), "AI returned an empty response");
            }

            return resp.choices().get(0).message().content();

        } catch (WebClientRequestException ex) {
            // Connection refused / timeout / tunnel down
            throw new ResponseStatusException(HttpStatusCode.valueOf(503),
                    "AI tunnel unreachable (connection refused/timeout): " + ex.getMessage());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(502),
                    "AI call failed: " + ex.getMessage());
        }
    }

    /**
     * Extract financial entities from raw user text.
     * Uses a strict system prompt to ensure the AI returns only valid JSON.
     *
     * @param userText raw text from the user (e.g., "Spent $50 at Starbucks yesterday")
     * @return JSON string content from AI (ready to be parsed into ExtractedFinancialEntitiesDto)
     */
    public String extractFinancialEntities(String userText) {
        String systemPrompt = """
            You are a financial information extraction engine.

            TASK
            Given user-provided raw text describing one or more financial transactions, extract key entities and return ONLY a JSON array that matches the schema below. Do not include any extra keys. Do not include markdown. Do not include explanations. Output must be valid JSON.
            
            RULES
            
            Output MUST be valid JSON and nothing else.

            Always return a JSON array, even if there is only one transaction.
            
            For CSV import, do not return null for date, amount, merchant, or category. If you cannot determine all required fields confidently, return an empty JSON array instead.
            
            Normalize amount to a number (use negative for spending, positive for income if direction is stated).
            
            Currency must be a 3-letter code (e.g., "USD") if known; otherwise null.
            
            Date must be ISO-8601 format "YYYY-MM-DD" if determinable; otherwise null.
            
            Merchant should be the best merchant/payee name; otherwise null.
            
            Category must be one of these exact values if inferable:
            Auto & transport
            Shopping
            Healthcare
            Drinks & dining
            Other
            Entertainment
            Groceries
            Kids
            Family
            Childcare & education
            Household
            Financial
            Taxes
            Personal care
            Travel & vacation
            Income
            If unsure, use "Other".
            
            Confidence must be a number from 0 to 1 indicating overall confidence.
            
            Never hallucinate. Prefer null when unsure.
            
            JSON SCHEMA (return exactly this array shape)
            [
              {
                "amount": null,
                "currency": null,
                "date": null,
                "merchant": null,
                "category": null,
                "note": null,
                "confidence": 0
              }
            ]
                """;

        LmStudioChatRequest req = new LmStudioChatRequest(
                modelName,
                List.of(
                        new LmStudioChatRequest.Message("system", systemPrompt),
                        new LmStudioChatRequest.Message("user", userText)
                ),
                0.1,  // Low temperature for more consistent JSON formatting
                500   // Reasonable token limit for structured response
        );

        try {
            LmStudioChatResponse resp = aiWebClient.post()
                    .uri("/chat/completions")
                    .bodyValue(req)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, r ->
                            r.bodyToMono(String.class).map(body ->
                                    new ResponseStatusException(
                                            HttpStatusCode.valueOf(r.statusCode().value()),
                                            "AI error: " + body
                                    )
                            )
                    )
                    .bodyToMono(LmStudioChatResponse.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (resp == null || resp.choices() == null || resp.choices().isEmpty()
                    || resp.choices().get(0).message() == null) {
                throw new ResponseStatusException(HttpStatusCode.valueOf(502), "AI returned an empty response");
            }

            return resp.choices().get(0).message().content();

        } catch (WebClientRequestException ex) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(503),
                    "AI tunnel unreachable (connection refused/timeout): " + ex.getMessage());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(502),
                    "AI call failed: " + ex.getMessage());
        }
    }

    public String extractFinancialEntitiesBatch(List<String> rows) {
        if (rows == null || rows.isEmpty()) {
            throw new IllegalArgumentException("rows are required");
        }

        String systemPrompt = """
              You are a financial information extraction engine for CSV imports.
            
               TASK
               You will receive a JSON array of CSV row strings. When the CSV file included headers, each row will be labelled as header=value pairs. Use those labels to determine which value is the date, merchant/payee/description, amount, debit, credit, category, or note. Return ONLY a JSON array with exactly one
               object per input row, in the same order.
            
               RULES
               Output MUST be valid JSON and nothing else.
               Return exactly one object per input row, preserving order.
               Never merge rows. Never split one row into multiple transactions.
            
               For each output object:
               - amount must be a number or null
               - currency must be a 3-letter code or null
               - date must be YYYY-MM-DD or null
               - merchant must be a string
               - category must be one of:
                 Auto & transport
                 Shopping
                 Healthcare
                 Drinks & dining
                 Other
                 Entertainment
                 Groceries
                 Kids
                 Family
                 Childcare & education
                 Household
                 Financial
                 Taxes
                 Personal care
                 Travel & vacation
                 Income
               - note may be null
               - confidence must be a number from 0 to 1
            
               JSON SCHEMA
               [
                 {
                   "amount": null,
                   "currency": null,
                   "date": null,
                   "merchant": null,
                   "category": null,
                   "note": null,
                   "confidence": 0
                 }
               ]
            
            """;

        List<String> sanitizedRows = new ArrayList<>(rows.size());
        for (int i = 0; i < rows.size(); i++) {
            sanitizedRows.add((i + 1) + ". " + rows.get(i));
        }

        LmStudioChatRequest req = new LmStudioChatRequest(
                modelName,
                List.of(
                        new LmStudioChatRequest.Message("system", systemPrompt),
                        new LmStudioChatRequest.Message("user", sanitizedRows.toString())
                ),
                0.0,
                1500
        );

        try {
            LmStudioChatResponse resp = aiWebClient.post()
                    .uri("/chat/completions")
                    .bodyValue(req)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, r ->
                            r.bodyToMono(String.class).map(body ->
                                    new ResponseStatusException(
                                            HttpStatusCode.valueOf(r.statusCode().value()),
                                            "AI error: " + body
                                    )
                            )
                    )
                    .bodyToMono(LmStudioChatResponse.class)
                    .timeout(Duration.ofSeconds(45))
                    .block();

            if (resp == null || resp.choices() == null || resp.choices().isEmpty()
                    || resp.choices().get(0).message() == null) {
                throw new ResponseStatusException(HttpStatusCode.valueOf(502), "AI returned an empty response");
            }

            return resp.choices().get(0).message().content();

        } catch (WebClientRequestException ex) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(503),
                    "AI tunnel unreachable (connection refused/timeout): " + ex.getMessage());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(502),
                    "AI batch call failed: " + ex.getMessage());
        }
    }

    public String generateExpenseCuttingInsights(String spendingDataJson) {
        String systemPrompt = """
            Analyze this spending data. Provide exactly 3 actionable bullet points on how to save money. Output strictly as a JSON array of 3 strings.

            RULES
            Output valid JSON only.
            Output exactly 3 strings.
            Each string must be one concise, actionable recommendation.
            Do not include markdown, numbering, extra keys, explanations, or surrounding text.
            Base the recommendations only on the provided spending totals and profile data.
            """;

        LmStudioChatRequest req = new LmStudioChatRequest(
                modelName,
                List.of(
                        new LmStudioChatRequest.Message("system", systemPrompt),
                        new LmStudioChatRequest.Message("user", spendingDataJson)
                ),
                0.1,
                350
        );

        try {
            LmStudioChatResponse resp = aiWebClient.post()
                    .uri("/chat/completions")
                    .bodyValue(req)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, r ->
                            r.bodyToMono(String.class).map(body ->
                                    new ResponseStatusException(
                                            HttpStatusCode.valueOf(r.statusCode().value()),
                                            "AI error: " + body
                                    )
                            )
                    )
                    .bodyToMono(LmStudioChatResponse.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (resp == null || resp.choices() == null || resp.choices().isEmpty()
                    || resp.choices().get(0).message() == null) {
                throw new ResponseStatusException(HttpStatusCode.valueOf(502), "AI returned an empty response");
            }

            return resp.choices().get(0).message().content();

        } catch (WebClientRequestException ex) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(503),
                    "AI tunnel unreachable (connection refused/timeout): " + ex.getMessage());
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(502),
                    "AI insight call failed: " + ex.getMessage());
        }
    }
}
