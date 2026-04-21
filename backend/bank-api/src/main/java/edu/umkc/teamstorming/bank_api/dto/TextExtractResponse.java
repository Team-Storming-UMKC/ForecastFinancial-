package edu.umkc.teamstorming.bank_api.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Map;

public class TextExtractResponse {

    private String rawText;
    private Map<String, Object> extracted;

    public TextExtractResponse(String rawText, Map<String, Object> extracted) {
        this.rawText = rawText;
        this.extracted = extracted;
    }

    public String getRawText() { return rawText; }
    public Map<String, Object> getExtracted() { return extracted; }

    @JsonIgnore
    public String getInput() { return rawText; }
}
