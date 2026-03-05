package edu.umkc.teamstorming.bank_api.ai;

import edu.umkc.teamstorming.bank_api.dto.LmStudioChatRequest;
import edu.umkc.teamstorming.bank_api.dto.LmStudioChatResponse;
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

    public AiClientService(WebClient aiWebClient) {
        this.aiWebClient = aiWebClient;
    }

    public String ping() {
        // Hardcoded test prompt
        LmStudioChatRequest req = new LmStudioChatRequest(
                "google/gemma-3-12b", // or whatever your local model id is
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
}