package edu.umkc.teamstorming.bank_api.subscription;

import edu.umkc.teamstorming.bank_api.transaction.Transaction;
import edu.umkc.teamstorming.bank_api.transaction.TransactionRepository;
import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SubscriptionService {

    private static final long MIN_INTERVAL_DAYS = 25;
    private static final long MAX_INTERVAL_DAYS = 35;
    private static final int MIN_TRANSACTIONS_FOR_PREDICTION = 3;
    private static final BigDecimal AMOUNT_TOLERANCE = new BigDecimal("2.00");

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public SubscriptionService(TransactionRepository transactionRepository,
                               UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public SubscriptionResponseDto listPredictedSubscriptions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        List<PredictedSubscriptionDto> subscriptions = transactions.stream()
                .filter(transaction -> transaction.getMerchantName() != null && !transaction.getMerchantName().isBlank())
                .collect(
                        LinkedHashMap<String, List<Transaction>>::new,
                        (map, transaction) -> map
                                .computeIfAbsent(normalizeMerchantName(transaction.getMerchantName()), ignored -> new ArrayList<>())
                                .add(transaction),
                        Map::putAll
                )
                .values()
                .stream()
                .map(this::predictSubscription)
                .flatMap(Optional::stream)
                .sorted(Comparator.comparing(PredictedSubscriptionDto::predictedNextChargeDate)
                        .thenComparing(PredictedSubscriptionDto::merchantName))
                .toList();

        return new SubscriptionResponseDto(subscriptions);
    }

    private Optional<PredictedSubscriptionDto> predictSubscription(List<Transaction> merchantTransactions) {
        List<Transaction> sortedTransactions = merchantTransactions.stream()
                .filter(transaction -> transaction.getAmount() != null && transaction.getDate() != null)
                .sorted(Comparator.comparing(Transaction::getDate))
                .toList();

        if (sortedTransactions.size() < MIN_TRANSACTIONS_FOR_PREDICTION) {
            return Optional.empty();
        }

        List<Transaction> bestSequence = new ArrayList<>();
        List<Transaction> currentSequence = new ArrayList<>();

        for (Transaction transaction : sortedTransactions) {
            if (currentSequence.isEmpty()) {
                currentSequence.add(transaction);
                continue;
            }

            Transaction previous = currentSequence.getLast();
            if (isRecurringPair(previous, transaction)) {
                currentSequence.add(transaction);
            } else {
                if (currentSequence.size() > bestSequence.size()) {
                    bestSequence = new ArrayList<>(currentSequence);
                }
                currentSequence = new ArrayList<>();
                currentSequence.add(transaction);
            }
        }

        if (currentSequence.size() > bestSequence.size()) {
            bestSequence = currentSequence;
        }

        if (bestSequence.size() < MIN_TRANSACTIONS_FOR_PREDICTION) {
            return Optional.empty();
        }

        Transaction latestTransaction = bestSequence.getLast();
        int predictedIntervalDays = predictIntervalDays(bestSequence);
        BigDecimal expectedAmount = averageAmount(bestSequence);

        return Optional.of(new PredictedSubscriptionDto(
                latestTransaction.getMerchantName(),
                expectedAmount,
                latestTransaction.getDate().plusDays(predictedIntervalDays)
        ));
    }

    private boolean isRecurringPair(Transaction previous, Transaction current) {
        long daysBetween = ChronoUnit.DAYS.between(previous.getDate(), current.getDate());
        if (daysBetween < MIN_INTERVAL_DAYS || daysBetween > MAX_INTERVAL_DAYS) {
            return false;
        }

        BigDecimal previousAmount = previous.getAmount().abs();
        BigDecimal currentAmount = current.getAmount().abs();
        BigDecimal difference = previousAmount.subtract(currentAmount).abs();

        return difference.compareTo(AMOUNT_TOLERANCE) <= 0;
    }

    private int predictIntervalDays(List<Transaction> transactions) {
        long totalIntervalDays = 0;
        for (int i = 1; i < transactions.size(); i++) {
            totalIntervalDays += ChronoUnit.DAYS.between(
                    transactions.get(i - 1).getDate(),
                    transactions.get(i).getDate()
            );
        }

        return Math.toIntExact(Math.round((double) totalIntervalDays / (transactions.size() - 1)));
    }

    private BigDecimal averageAmount(List<Transaction> transactions) {
        BigDecimal total = transactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return total.divide(BigDecimal.valueOf(transactions.size()), 2, RoundingMode.HALF_UP);
    }

    private String normalizeMerchantName(String merchantName) {
        return merchantName.trim().toLowerCase();
    }
}
