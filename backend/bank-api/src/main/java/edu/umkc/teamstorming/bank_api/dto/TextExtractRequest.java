package edu.umkc.teamstorming.bank_api.dto;

import jakarta.validation.constraints.NotBlank;

public class TextExtractRequest {

    @NotBlank(message = "text is required")
    private String text;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
