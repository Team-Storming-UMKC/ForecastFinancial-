package edu.umkc.teamstorming.bank_api.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.umkc.teamstorming.bank_api.dto.LmStudioChatResponse;
import edu.umkc.teamstorming.bank_api.dto.ExtractedFinancialEntitiesDto;
import org.springframework.stereotype.Service;

@Service
public class LmStudioParser {

    private final ObjectMapper objectMapper;

    public LmStudioParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * @param lmStudioRawJson the full JSON response from LM Studio (as a String)
     */
    public ExtractedFinancialEntitiesDto parseEntities(String lmStudioRawJson) {
        // 1) Map full LM Studio JSON -> DTO
        LmStudioChatResponse resp = readLmStudioResponse(lmStudioRawJson);

        // 2) Extract content string
        String content = extractContent(resp);

        // 3) The content should be JSON-only (from your system prompt). Parse it -> your DTO
        return readEntitiesJson(content);
    }

    private LmStudioChatResponse readLmStudioResponse(String lmStudioRawJson) {
        try {
            return objectMapper.readValue(lmStudioRawJson, LmStudioChatResponse.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid LM Studio JSON response", e);
        }
    }

    private String extractContent(LmStudioChatResponse resp) {
        if (resp == null || resp.choices() == null || resp.choices().isEmpty()) {
            throw new IllegalArgumentException("LM Studio response missing choices[0]");
        }
        var msg = resp.choices().get(0).message();
        if (msg == null || msg.content() == null) {
            throw new IllegalArgumentException("LM Studio response missing choices[0].message.content");
        }
        return msg.content().trim();
    }

    private ExtractedFinancialEntitiesDto readEntitiesJson(String content) {
        // Optional safety: remove ```json fences if the model ever violates your “JSON only” rule
        String cleaned = stripCodeFences(content);

        try {
            return objectMapper.readValue(cleaned, ExtractedFinancialEntitiesDto.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Model content was not valid JSON for ExtractedFinancialEntitiesDto. Content=" + cleaned, e);
        }
    }

    private String stripCodeFences(String s) {
        String t = s.trim();
        if (t.startsWith("```")) {
            // remove first fence line and last fence
            t = t.replaceFirst("^```[a-zA-Z]*\\s*", "");
            t = t.replaceFirst("\\s*```\\s*$", "");
        }
        return t.trim();
    }
}
