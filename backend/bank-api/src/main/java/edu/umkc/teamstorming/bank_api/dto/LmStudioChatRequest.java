package edu.umkc.teamstorming.bank_api.dto;


import java.util.List;

public record LmStudioChatRequest(
        String model,
        List<Message> messages,
        double temperature,
        int max_tokens
) {
    public record Message(String role, String content) {}
}
