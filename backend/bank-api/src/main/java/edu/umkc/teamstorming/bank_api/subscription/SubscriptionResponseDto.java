package edu.umkc.teamstorming.bank_api.subscription;

import java.util.List;

public record SubscriptionResponseDto(
        List<PredictedSubscriptionDto> subscriptions
) {
}
