package edu.umkc.teamstorming.bank_api.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.umkc.teamstorming.bank_api.dto.ExtractedFinancialEntitiesDto;
import edu.umkc.teamstorming.bank_api.dto.LmStudioChatResponse;
import org.springframework.stereotype.Service;

import java.util.List;

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
        LmStudioChatResponse resp = readLmStudioResponse(lmStudioRawJson);
        String content = extractContent(resp);
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

    public ExtractedFinancialEntitiesDto readEntitiesJson(String content) {
        List<ExtractedFinancialEntitiesDto> entities = readEntitiesJsonList(content);
        if (entities.isEmpty()) {
            throw new IllegalArgumentException("Model content did not contain any extracted entities");
        }
        return entities.getFirst();
    }

    public List<ExtractedFinancialEntitiesDto> readEntitiesJsonList(String content) {
        if (content == null) {
            throw new IllegalArgumentException("Model content was null");
        }

        String cleaned = stripCodeFences(content);

        try {
            if (cleaned.startsWith("[")) {
                return objectMapper.readValue(cleaned, new TypeReference<List<ExtractedFinancialEntitiesDto>>() {});
            }

            ExtractedFinancialEntitiesDto single = objectMapper.readValue(cleaned, ExtractedFinancialEntitiesDto.class);
            return List.of(single);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Model content was not valid JSON for ExtractedFinancialEntitiesDto. Content=" + cleaned, e);
        }
    }

    private String stripCodeFences(String s) {
        String t = s.trim();
        if (t.startsWith("```")) {
            t = t.replaceFirst("^```[a-zA-Z]*\\s*", "");
            t = t.replaceFirst("\\s*```\\s*$", "");
        }
        return t.trim();
    }
}
