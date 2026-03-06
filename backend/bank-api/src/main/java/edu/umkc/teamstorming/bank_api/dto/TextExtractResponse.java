package edu.umkc.teamstorming.bank_api.dto;

import java.util.Map;

public class TextExtractResponse {

    private String input;
    private Map<String, Object> extracted;

    public TextExtractResponse(String input, Map<String, Object> extracted) {
        this.input = input;
        this.extracted = extracted;
    }

    public String getInput() { return input; }
    public Map<String, Object> getExtracted() { return extracted; }
}
