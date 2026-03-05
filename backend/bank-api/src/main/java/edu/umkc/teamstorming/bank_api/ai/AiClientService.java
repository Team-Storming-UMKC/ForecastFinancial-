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
            Given a user-provided raw text describing a financial transaction, extract key entities and return ONLY a single JSON object that matches the schema below. Do not include any extra keys. Do not include markdown. Do not include explanations. Output must be valid JSON.
            
            RULES
            
            Output MUST be valid JSON and nothing else.
            
            If a field is not present or cannot be confidently determined, use null (not an empty string).
            
            Normalize amount to a number (use negative for spending, positive for income if direction is stated).
            
            Currency must be a 3-letter code (e.g., "USD") if known; otherwise null.
            
            Date must be ISO-8601 format "YYYY-MM-DD" if determinable; otherwise null.
            
            Merchant should be the best merchant/payee name; otherwise null.
            
            Category should be a short label if inferable; otherwise null.
            
            Confidence must be a number from 0 to 1 indicating overall confidence.
            
            Never hallucinate. Prefer null when unsure.
            
            JSON SCHEMA (return exactly this shape)
            {
             "amount": null,
             "currency": null,
             "date": null,
             "merchant": null,
             "category": null,
             "note": null,
             "confidence": 0
            }
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
}