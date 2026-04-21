package edu.umkc.teamstorming.bank_api.SubscriptionTest;

import edu.umkc.teamstorming.bank_api.subscription.PredictedSubscriptionDto;
import edu.umkc.teamstorming.bank_api.subscription.SubscriptionResponseDto;
import edu.umkc.teamstorming.bank_api.subscription.SubscriptionService;
import edu.umkc.teamstorming.bank_api.transaction.Transaction;
import edu.umkc.teamstorming.bank_api.transaction.TransactionRepository;
import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubscriptionService")
class SubscriptionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private SubscriptionService subscriptionService;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private User stubUser(String email) {
        User user = new User();
        user.setId(42L);
        user.setEmail(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        return user;
    }

    /**
     * Build a minimal Transaction with the fields SubscriptionService actually reads.
     */
    private Transaction tx(String merchant, LocalDate date, String amount) {
        Transaction t = new Transaction();
        t.setMerchantName(merchant);
        t.setDate(date);
        t.setAmount(new BigDecimal(amount));
        return t;
    }

    /**
     * Three monthly transactions at ~30-day spacing — the minimum to get a prediction.
     */
    private List<Transaction> threeMonthly(String merchant) {
        LocalDate base = LocalDate.of(2024, 1, 1);
        return List.of(
                tx(merchant, base,            "-9.99"),
                tx(merchant, base.plusDays(30), "-9.99"),
                tx(merchant, base.plusDays(60), "-9.99")
        );
    }

    // -----------------------------------------------------------------------
    // User resolution
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("User resolution")
    class UserResolution {

        @Test
        @DisplayName("throws RuntimeException when user is not found")
        void throwsWhenUserNotFound() {
            when(userRepository.findByEmail("ghost@x.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> subscriptionService.listPredictedSubscriptions("ghost@x.com"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("User not found");

            verifyNoInteractions(transactionRepository);
        }

        @Test
        @DisplayName("queries transactions using the resolved user id")
        void queriesTransactionsWithCorrectUserId() {
            User user = stubUser("alice@x.com");
            when(transactionRepository.findByUserId(user.getId())).thenReturn(Collections.emptyList());

            subscriptionService.listPredictedSubscriptions("alice@x.com");

            verify(transactionRepository).findByUserId(42L);
        }
    }

    // -----------------------------------------------------------------------
    // Merchant name filtering and normalisation
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("Merchant name filtering and normalisation")
    class MerchantFiltering {

        @Test
        @DisplayName("transactions with null merchant name are ignored")
        void ignoresNullMerchantName() {
            stubUser("alice@x.com");
            List<Transaction> txns = List.of(tx(null, LocalDate.now(), "-9.99"));
            when(transactionRepository.findByUserId(42L)).thenReturn(txns);

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            assertThat(result.subscriptions()).isEmpty();
        }

        @Test
        @DisplayName("transactions with blank merchant name are ignored")
        void ignoresBlankMerchantName() {
            stubUser("alice@x.com");
            List<Transaction> txns = List.of(tx("   ", LocalDate.now(), "-9.99"));
            when(transactionRepository.findByUserId(42L)).thenReturn(txns);

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            assertThat(result.subscriptions()).isEmpty();
        }

        @Test
        @DisplayName("merchant names differing only in case are grouped together")
        void groupsMerchantNamesCaseInsensitively() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            // Same logical merchant, mixed casing across 3 transactions
            List<Transaction> txns = List.of(
                    tx("Netflix",  base,            "-15.99"),
                    tx("NETFLIX",  base.plusDays(30), "-15.99"),
                    tx("netflix",  base.plusDays(60), "-15.99")
            );
            when(transactionRepository.findByUserId(42L)).thenReturn(txns);

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            // All three should be grouped, producing exactly one subscription
            assertThat(result.subscriptions()).hasSize(1);
        }

        @Test
        @DisplayName("merchant names differing only in leading/trailing spaces are grouped together")
        void groupsMerchantNamesAfterTrim() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            List<Transaction> txns = List.of(
                    tx("Spotify",   base,            "-9.99"),
                    tx(" Spotify",  base.plusDays(30), "-9.99"),
                    tx("Spotify ",  base.plusDays(60), "-9.99")
            );
            when(transactionRepository.findByUserId(42L)).thenReturn(txns);

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            assertThat(result.subscriptions()).hasSize(1);
        }
    }

    // -----------------------------------------------------------------------
    // Minimum-transaction threshold
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("Minimum transaction threshold")
    class MinTransactionThreshold {

        @Test
        @DisplayName("returns no subscriptions when all transactions are empty")
        void returnsEmptyWhenNoTransactions() {
            stubUser("alice@x.com");
            when(transactionRepository.findByUserId(42L)).thenReturn(Collections.emptyList());

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            assertThat(result.subscriptions()).isEmpty();
        }

        @Test
        @DisplayName("returns no subscription for a merchant with only 1 transaction")
        void returnsEmptyForSingleTransaction() {
            stubUser("alice@x.com");
            when(transactionRepository.findByUserId(42L))
                    .thenReturn(List.of(tx("Netflix", LocalDate.of(2024, 1, 1), "-15.99")));

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            assertThat(result.subscriptions()).isEmpty();
        }

        @Test
        @DisplayName("returns no subscription for a merchant with only 2 monthly transactions")
        void returnsEmptyForTwoTransactions() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Netflix", base,            "-15.99"),
                    tx("Netflix", base.plusDays(30), "-15.99")
            ));

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            assertThat(result.subscriptions()).isEmpty();
        }

        @Test
        @DisplayName("returns a subscription for a merchant with exactly 3 recurring transactions")
        void returnsSubscriptionForThreeTransactions() {
            stubUser("alice@x.com");
            when(transactionRepository.findByUserId(42L)).thenReturn(threeMonthly("Netflix"));

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            assertThat(result.subscriptions()).hasSize(1);
        }
    }

    // -----------------------------------------------------------------------
    // Recurring-pair detection — interval window
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("Recurring-pair interval window (25–35 days)")
    class IntervalWindow {

        @Test
        @DisplayName("detects a pair spaced exactly 25 days apart as recurring")
        void accepts25DayInterval() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Hulu", base,            "-7.99"),
                    tx("Hulu", base.plusDays(25), "-7.99"),
                    tx("Hulu", base.plusDays(50), "-7.99")
            ));

            assertThat(subscriptionService.listPredictedSubscriptions("alice@x.com")
                    .subscriptions()).hasSize(1);
        }

        @Test
        @DisplayName("detects a pair spaced exactly 35 days apart as recurring")
        void accepts35DayInterval() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Hulu", base,            "-7.99"),
                    tx("Hulu", base.plusDays(35), "-7.99"),
                    tx("Hulu", base.plusDays(70), "-7.99")
            ));

            assertThat(subscriptionService.listPredictedSubscriptions("alice@x.com")
                    .subscriptions()).hasSize(1);
        }

        @Test
        @DisplayName("rejects a pair spaced only 24 days apart (below minimum)")
        void rejects24DayInterval() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Hulu", base,            "-7.99"),
                    tx("Hulu", base.plusDays(24), "-7.99"),
                    tx("Hulu", base.plusDays(48), "-7.99")
            ));

            assertThat(subscriptionService.listPredictedSubscriptions("alice@x.com")
                    .subscriptions()).isEmpty();
        }

        @Test
        @DisplayName("rejects a pair spaced 36 days apart (above maximum)")
        void rejects36DayInterval() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Hulu", base,            "-7.99"),
                    tx("Hulu", base.plusDays(36), "-7.99"),
                    tx("Hulu", base.plusDays(72), "-7.99")
            ));

            assertThat(subscriptionService.listPredictedSubscriptions("alice@x.com")
                    .subscriptions()).isEmpty();
        }
    }

    // -----------------------------------------------------------------------
    // Recurring-pair detection — amount tolerance
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("Recurring-pair amount tolerance ($2.00)")
    class AmountTolerance {

        @Test
        @DisplayName("accepts amounts with exactly $2.00 difference")
        void acceptsExactlyTwoDollarDifference() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Adobe", base,            "-9.99"),
                    tx("Adobe", base.plusDays(30), "-11.99"),  // $2.00 more
                    tx("Adobe", base.plusDays(60), "-9.99")
            ));

            assertThat(subscriptionService.listPredictedSubscriptions("alice@x.com")
                    .subscriptions()).hasSize(1);
        }

        @Test
        @DisplayName("rejects amounts differing by more than $2.00")
        void rejectsMoreThanTwoDollarDifference() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Adobe", base,            "-9.99"),
                    tx("Adobe", base.plusDays(30), "-12.00"),  // $2.01 more
                    tx("Adobe", base.plusDays(60), "-9.99")
            ));

            assertThat(subscriptionService.listPredictedSubscriptions("alice@x.com")
                    .subscriptions()).isEmpty();
        }

        @Test
        @DisplayName("compares amounts using absolute value (negative charges handled correctly)")
        void usesAbsoluteValueForComparison() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            // All amounts are negative (typical bank debits)
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Spotify", base,            "-9.99"),
                    tx("Spotify", base.plusDays(30), "-9.99"),
                    tx("Spotify", base.plusDays(60), "-9.99")
            ));

            assertThat(subscriptionService.listPredictedSubscriptions("alice@x.com")
                    .subscriptions()).hasSize(1);
        }
    }

    // -----------------------------------------------------------------------
    // Predicted next charge date and amount
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("Prediction output — date and amount")
    class PredictionOutput {

        @Test
        @DisplayName("predicted next charge date is latest transaction date plus average interval")
        void predictsCorrectNextChargeDate() {
            stubUser("alice@x.com");
            // Intervals: 30, 30 → average 30 days. Latest date = Jan 31.
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Netflix", base,                   "-15.99"),
                    tx("Netflix", base.plusDays(30), "-15.99"),
                    tx("Netflix", base.plusDays(60), "-15.99")
            ));

            PredictedSubscriptionDto sub = subscriptionService
                    .listPredictedSubscriptions("alice@x.com")
                    .subscriptions().get(0);

            assertThat(sub.predictedNextChargeDate())
                    .isEqualTo(base.plusDays(60).plusDays(30));  // Mar 1
        }

        @Test
        @DisplayName("predicted interval is rounded average of all gaps in the best sequence")
        void predictsRoundedAverageInterval() {
            stubUser("alice@x.com");
            // Intervals: 29, 31 → average 30 days
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Hulu", base,            "-7.99"),
                    tx("Hulu", base.plusDays(29), "-7.99"),
                    tx("Hulu", base.plusDays(60), "-7.99")   // 31 days after previous
            ));

            PredictedSubscriptionDto sub = subscriptionService
                    .listPredictedSubscriptions("alice@x.com")
                    .subscriptions().get(0);

            assertThat(sub.predictedNextChargeDate())
                    .isEqualTo(base.plusDays(60).plusDays(30));
        }

        @Test
        @DisplayName("expected amount is the average of the best sequence amounts (HALF_UP)")
        void computesAverageAmount() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            // Amounts: -9.99, -10.99, -9.99 → sum = -30.97, avg = -10.32 (HALF_UP)
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Adobe", base,            "-9.99"),
                    tx("Adobe", base.plusDays(30), "-10.99"),
                    tx("Adobe", base.plusDays(60), "-9.99")
            ));

            PredictedSubscriptionDto sub = subscriptionService
                    .listPredictedSubscriptions("alice@x.com")
                    .subscriptions().get(0);

            assertThat(sub.expectedAmount()).isEqualByComparingTo(new BigDecimal("-10.32"));
        }

        @Test
        @DisplayName("merchant name on the DTO matches the last transaction in the best sequence")
        void merchantNameMatchesLastTransaction() {
            stubUser("alice@x.com");
            when(transactionRepository.findByUserId(42L)).thenReturn(threeMonthly("Spotify"));

            PredictedSubscriptionDto sub = subscriptionService
                    .listPredictedSubscriptions("alice@x.com")
                    .subscriptions().get(0);

            assertThat(sub.merchantName()).isEqualTo("Spotify");
        }
    }

    // -----------------------------------------------------------------------
    // Best-sequence selection
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("Best-sequence selection")
    class BestSequenceSelection {

        @Test
        @DisplayName("ignores non-recurring transactions interspersed with a valid run")
        void picksLongestRecurringRun() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            /*
             * Sequence for "Netflix":
             *  Jan 1  → Jan 5 (4 days apart — NOT recurring)
             *  Jan 5  → Feb 4 (30 days — recurring)
             *  Feb 4  → Mar 5 (29 days — recurring)
             *  Mar 5  → Apr 4 (30 days — recurring)
             *
             * Best run: Jan 5 → Feb 4 → Mar 5 → Apr 4 (4 txns ≥ 3)
             */
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Netflix", base,            "-9.99"),      // isolated
                    tx("Netflix", base.plusDays(4), "-9.99"),     // start of best run
                    tx("Netflix", base.plusDays(34), "-9.99"),    // +30
                    tx("Netflix", base.plusDays(63), "-9.99"),    // +29
                    tx("Netflix", base.plusDays(93), "-9.99")     // +30
            ));

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            assertThat(result.subscriptions()).hasSize(1);
        }

        @Test
        @DisplayName("transactions with null date or amount are excluded from sequence consideration")
        void filtersOutNullDateOrAmount() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            Transaction nullDate = new Transaction();
            nullDate.setMerchantName("Netflix");
            nullDate.setAmount(new BigDecimal("-9.99"));
            // date intentionally null

            Transaction nullAmount = new Transaction();
            nullAmount.setMerchantName("Netflix");
            nullAmount.setDate(base.plusDays(90));
            // amount intentionally null

            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    nullDate,
                    tx("Netflix", base,            "-9.99"),
                    tx("Netflix", base.plusDays(30), "-9.99"),
                    tx("Netflix", base.plusDays(60), "-9.99"),
                    nullAmount
            ));

            // Valid run of 3 should still be found despite the invalid entries
            assertThat(subscriptionService.listPredictedSubscriptions("alice@x.com")
                    .subscriptions()).hasSize(1);
        }
    }

    // -----------------------------------------------------------------------
    // Result ordering
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("Result ordering")
    class ResultOrdering {

        @Test
        @DisplayName("subscriptions are sorted by predictedNextChargeDate ascending")
        void sortsByNextChargeDateAscending() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            // Hulu charges later than Netflix
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Hulu",    base.plusDays(5),  "-7.99"),
                    tx("Hulu",    base.plusDays(35), "-7.99"),
                    tx("Hulu",    base.plusDays(65), "-7.99"),
                    tx("Netflix", base,              "-15.99"),
                    tx("Netflix", base.plusDays(30), "-15.99"),
                    tx("Netflix", base.plusDays(60), "-15.99")
            ));

            List<PredictedSubscriptionDto> subs = subscriptionService
                    .listPredictedSubscriptions("alice@x.com").subscriptions();

            assertThat(subs).hasSize(2);
            assertThat(subs.get(0).predictedNextChargeDate())
                    .isBeforeOrEqualTo(subs.get(1).predictedNextChargeDate());
        }

        @Test
        @DisplayName("subscriptions with the same next-charge date are sorted by merchant name")
        void sortsByMerchantNameWhenDatesAreEqual() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            // Both merchants have the same base date and 30-day intervals → same predicted date
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Zoom",    base,            "-14.99"),
                    tx("Zoom",    base.plusDays(30), "-14.99"),
                    tx("Zoom",    base.plusDays(60), "-14.99"),
                    tx("Adobe",   base,            "-9.99"),
                    tx("Adobe",   base.plusDays(30), "-9.99"),
                    tx("Adobe",   base.plusDays(60), "-9.99")
            ));

            List<PredictedSubscriptionDto> subs = subscriptionService
                    .listPredictedSubscriptions("alice@x.com").subscriptions();

            assertThat(subs).hasSize(2);
            assertThat(subs.get(0).merchantName()).isLessThanOrEqualTo(subs.get(1).merchantName());
        }
    }

    // -----------------------------------------------------------------------
    // Multiple merchants
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("Multiple merchants")
    class MultipleMerchants {

        @Test
        @DisplayName("detects subscriptions independently for two different merchants")
        void detectsTwoMerchantsIndependently() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    tx("Netflix", base,            "-15.99"),
                    tx("Netflix", base.plusDays(30), "-15.99"),
                    tx("Netflix", base.plusDays(60), "-15.99"),
                    tx("Spotify", base.plusDays(5),  "-9.99"),
                    tx("Spotify", base.plusDays(35), "-9.99"),
                    tx("Spotify", base.plusDays(65), "-9.99")
            ));

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            assertThat(result.subscriptions())
                    .hasSize(2)
                    .extracting(PredictedSubscriptionDto::merchantName)
                    .containsExactlyInAnyOrder("Netflix", "Spotify");
        }

        @Test
        @DisplayName("includes only the merchant that meets the threshold when one does not")
        void includesOnlyQualifyingMerchant() {
            stubUser("alice@x.com");
            LocalDate base = LocalDate.of(2024, 1, 1);
            when(transactionRepository.findByUserId(42L)).thenReturn(List.of(
                    // Netflix: 3 recurring → qualifies
                    tx("Netflix", base,            "-15.99"),
                    tx("Netflix", base.plusDays(30), "-15.99"),
                    tx("Netflix", base.plusDays(60), "-15.99"),
                    // OneOff: only 2 → does not qualify
                    tx("OneOff",  base,            "-5.00"),
                    tx("OneOff",  base.plusDays(30), "-5.00")
            ));

            SubscriptionResponseDto result = subscriptionService.listPredictedSubscriptions("alice@x.com");

            assertThat(result.subscriptions())
                    .hasSize(1)
                    .extracting(PredictedSubscriptionDto::merchantName)
                    .containsExactly("Netflix");
        }
    }
}