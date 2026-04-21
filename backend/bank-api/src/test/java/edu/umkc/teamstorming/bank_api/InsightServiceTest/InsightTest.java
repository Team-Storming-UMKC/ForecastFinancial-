package edu.umkc.teamstorming.bank_api.InsightServiceTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.umkc.teamstorming.bank_api.ai.AiClientService;
import edu.umkc.teamstorming.bank_api.ai.LmStudioParser;
import edu.umkc.teamstorming.bank_api.insight.InsightService;
import edu.umkc.teamstorming.bank_api.transaction.CategorySpendingSummary;
import edu.umkc.teamstorming.bank_api.transaction.TransactionRepository;
import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InsightService")
class InsightServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private AiClientService aiClientService;
    @Mock private LmStudioParser lmStudioParser;

    // Use a real ObjectMapper so buildPromptData serialisation is exercised properly
    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private InsightService insightService;

    // Re-inject with real ObjectMapper because @InjectMocks uses the mock above
    @BeforeEach
    void injectRealObjectMapper() {
        insightService = new InsightService(
                transactionRepository,
                userRepository,
                aiClientService,
                lmStudioParser,
                objectMapper
        );
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    private User buildUser(String email) {
        User user = new User();
        setUserField(user, "id", 1L);
        user.setEmail(email);
        user.setFirstName("Alice");
        user.setDateOfBirth(LocalDate.of(1990, 1, 15));
        setUserField(user, "createdAt", LocalDateTime.of(2023, 6, 1, 0, 0));
        return user;
    }

    private void setUserField(User user, String fieldName, Object value) {
        try {
            Field field = User.class.getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(user, value);
        } catch (ReflectiveOperationException e) {
            throw new AssertionError("Failed to set User." + fieldName + " in test setup", e);
        }
    }

    private CategorySpendingSummary buildSummary(String category, double total, int count) {
        CategorySpendingSummary summary = mock(CategorySpendingSummary.class);
        when(summary.getCategory()).thenReturn(category);
        when(summary.getTotalSpent()).thenReturn(BigDecimal.valueOf(total));
        when(summary.getTransactionCount()).thenReturn((long) count);
        return summary;
    }

    // ---------------------------------------------------------------------------
    // Happy-path
    // ---------------------------------------------------------------------------
    @Nested
    @DisplayName("getExpenseCuttingInsights — happy path")
    class HappyPath {

        @Test
        @DisplayName("returns 3 insight strings from the AI when all dependencies succeed")
        void returnsThreeInsights() {
            String email = "alice@example.com";
            User user = buildUser(email);
            List<CategorySpendingSummary> spending = List.of(
                    buildSummary("Food", 320.50, 12),
                    buildSummary("Entertainment", 95.00, 4)
            );
            List<String> expectedInsights = List.of("Tip 1", "Tip 2", "Tip 3");

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
            when(transactionRepository.findSpendingByCategorySince(eq(1L), any(LocalDate.class)))
                    .thenReturn(spending);
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[\"Tip 1\",\"Tip 2\",\"Tip 3\"]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(expectedInsights);

            List<String> result = insightService.getExpenseCuttingInsights(email);

            assertThat(result).containsExactly("Tip 1", "Tip 2", "Tip 3");
        }

        @Test
        @DisplayName("works correctly when category spending list is empty")
        void handlesEmptySpendingList() {
            String email = "alice@example.com";
            User user = buildUser(email);
            List<String> expectedInsights = List.of("A", "B", "C");

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
            when(transactionRepository.findSpendingByCategorySince(eq(1L), any(LocalDate.class)))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(expectedInsights);

            List<String> result = insightService.getExpenseCuttingInsights(email);

            assertThat(result).hasSize(3);
        }

        @Test
        @DisplayName("uses the correct user id when querying transactions")
        void queriesTransactionsWithCorrectUserId() {
            String email = "alice@example.com";
            User user = buildUser(email);  // id = 1L

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
            when(transactionRepository.findSpendingByCategorySince(eq(1L), any(LocalDate.class)))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(List.of("a", "b", "c"));

            insightService.getExpenseCuttingInsights(email);

            verify(transactionRepository).findSpendingByCategorySince(eq(1L), any(LocalDate.class));
        }

        @Test
        @DisplayName("passes a start date roughly 90 days in the past to the repository")
        void passesCorrectStartDateToRepository() {
            String email = "alice@example.com";
            User user = buildUser(email);

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
            when(transactionRepository.findSpendingByCategorySince(anyLong(), any(LocalDate.class)))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(List.of("a", "b", "c"));

            insightService.getExpenseCuttingInsights(email);

            ArgumentCaptor<LocalDate> dateCaptor = ArgumentCaptor.forClass(LocalDate.class);
            verify(transactionRepository).findSpendingByCategorySince(anyLong(), dateCaptor.capture());

            LocalDate capturedDate = dateCaptor.getValue();
            LocalDate expectedStart = LocalDate.now().minusDays(90);
            // Allow a 1-day tolerance to guard against midnight edge cases in CI
            assertThat(capturedDate).isBetween(expectedStart.minusDays(1), expectedStart.plusDays(1));
        }

        @Test
        @DisplayName("forwards the AI JSON string to the parser verbatim")
        void forwardsAiJsonToParser() {
            String email = "alice@example.com";
            String rawAiJson = "[\"insight one\",\"insight two\",\"insight three\"]";

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(buildUser(email)));
            when(transactionRepository.findSpendingByCategorySince(anyLong(), any()))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn(rawAiJson);
            when(lmStudioParser.readThreeStringArray(rawAiJson)).thenReturn(List.of("a", "b", "c"));

            insightService.getExpenseCuttingInsights(email);

            verify(lmStudioParser).readThreeStringArray(rawAiJson);
        }

        @Test
        @DisplayName("prompt payload sent to AI contains profile, spendingWindow, and spendingByCategory keys")
        void promptPayloadContainsExpectedTopLevelKeys() throws Exception {
            String email = "alice@example.com";
            User user = buildUser(email);
            List<CategorySpendingSummary> spending = List.of(buildSummary("Groceries", 150.0, 6));

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
            when(transactionRepository.findSpendingByCategorySince(anyLong(), any()))
                    .thenReturn(spending);
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(List.of("a", "b", "c"));

            ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
            insightService.getExpenseCuttingInsights(email);
            verify(aiClientService).generateExpenseCuttingInsights(promptCaptor.capture());

            String prompt = promptCaptor.getValue();
            @SuppressWarnings("unchecked")
            var parsed = objectMapper.readValue(prompt, java.util.Map.class);
            assertThat(parsed).containsKeys("profile", "spendingWindow", "spendingByCategory");
        }

        @Test
        @DisplayName("prompt payload includes correct firstName from user profile")
        void promptPayloadIncludesFirstName() throws Exception {
            String email = "alice@example.com";
            User user = buildUser(email); // firstName = "Alice"

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
            when(transactionRepository.findSpendingByCategorySince(anyLong(), any()))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(List.of("a", "b", "c"));

            ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
            insightService.getExpenseCuttingInsights(email);
            verify(aiClientService).generateExpenseCuttingInsights(captor.capture());

            @SuppressWarnings("unchecked")
            var profile = (java.util.Map<String, Object>)
                    objectMapper.readValue(captor.getValue(), java.util.Map.class).get("profile");
            assertThat(profile.get("firstName")).isEqualTo("Alice");
        }

        @Test
        @DisplayName("prompt payload spendingWindow contains 90 days lookback")
        void promptPayloadContains90DaysLookback() throws Exception {
            String email = "alice@example.com";

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(buildUser(email)));
            when(transactionRepository.findSpendingByCategorySince(anyLong(), any()))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(List.of("a", "b", "c"));

            ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
            insightService.getExpenseCuttingInsights(email);
            verify(aiClientService).generateExpenseCuttingInsights(captor.capture());

            @SuppressWarnings("unchecked")
            var window = (java.util.Map<String, Object>)
                    objectMapper.readValue(captor.getValue(), java.util.Map.class).get("spendingWindow");
            assertThat(window.get("days")).isEqualTo(90);
        }

        @Test
        @DisplayName("handles user with null dateOfBirth and createdAt without throwing")
        void handlesNullUserFields() {
            String email = "bob@example.com";
            User user = new User();
            setUserField(user, "id", 2L);
            user.setEmail(email);
            user.setFirstName("Bob");
            // dateOfBirth and createdAt intentionally null

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
            when(transactionRepository.findSpendingByCategorySince(eq(2L), any()))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(List.of("x", "y", "z"));

            assertThatNoException().isThrownBy(() -> insightService.getExpenseCuttingInsights(email));
        }
    }

    // ---------------------------------------------------------------------------
    // Error cases
    // ---------------------------------------------------------------------------
    @Nested
    @DisplayName("getExpenseCuttingInsights — error handling")
    class ErrorHandling {

        @Test
        @DisplayName("throws 404 ResponseStatusException when user is not found")
        void throws404WhenUserNotFound() {
            when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> insightService.getExpenseCuttingInsights("unknown@example.com"))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode().value()).isEqualTo(404);
                    });

            verifyNoInteractions(transactionRepository, aiClientService, lmStudioParser);
        }

        @Test
        @DisplayName("throws 502 ResponseStatusException when parser rejects the AI response")
        void throws502WhenParserThrowsIllegalArgumentException() {
            String email = "alice@example.com";
            User user = buildUser(email);

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
            when(transactionRepository.findSpendingByCategorySince(anyLong(), any()))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("bad-json");
            when(lmStudioParser.readThreeStringArray("bad-json"))
                    .thenThrow(new IllegalArgumentException("Expected array of 3 strings"));

            assertThatThrownBy(() -> insightService.getExpenseCuttingInsights(email))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode().value()).isEqualTo(502);
                        assertThat(rse.getReason()).contains("AI returned invalid insights JSON");
                    });
        }

        @Test
        @DisplayName("does not call AI when user lookup fails")
        void doesNotCallAiWhenUserNotFound() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> insightService.getExpenseCuttingInsights("nobody@x.com"))
                    .isInstanceOf(ResponseStatusException.class);

            verifyNoInteractions(aiClientService);
        }

        @Test
        @DisplayName("does not call AI when transaction repository throws")
        void doesNotCallAiWhenRepositoryThrows() {
            String email = "alice@example.com";
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(buildUser(email)));
            when(transactionRepository.findSpendingByCategorySince(anyLong(), any()))
                    .thenThrow(new RuntimeException("DB error"));

            assertThatThrownBy(() -> insightService.getExpenseCuttingInsights(email))
                    .isInstanceOf(RuntimeException.class);

            verifyNoInteractions(aiClientService, lmStudioParser);
        }
    }

    // ---------------------------------------------------------------------------
    // Interaction / call-count guards
    // ---------------------------------------------------------------------------
    @Nested
    @DisplayName("Interaction contracts")
    class InteractionContracts {

        @Test
        @DisplayName("calls userRepository exactly once per invocation")
        void callsUserRepositoryOnce() {
            String email = "alice@example.com";
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(buildUser(email)));
            when(transactionRepository.findSpendingByCategorySince(anyLong(), any()))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(List.of("a", "b", "c"));

            insightService.getExpenseCuttingInsights(email);

            verify(userRepository, times(1)).findByEmail(email);
        }

        @Test
        @DisplayName("calls aiClientService exactly once per invocation")
        void callsAiClientOnce() {
            String email = "alice@example.com";
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(buildUser(email)));
            when(transactionRepository.findSpendingByCategorySince(anyLong(), any()))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(List.of("a", "b", "c"));

            insightService.getExpenseCuttingInsights(email);

            verify(aiClientService, times(1)).generateExpenseCuttingInsights(anyString());
        }

        @Test
        @DisplayName("calls lmStudioParser exactly once per invocation")
        void callsParserOnce() {
            String email = "alice@example.com";
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(buildUser(email)));
            when(transactionRepository.findSpendingByCategorySince(anyLong(), any()))
                    .thenReturn(Collections.emptyList());
            when(aiClientService.generateExpenseCuttingInsights(anyString())).thenReturn("[]");
            when(lmStudioParser.readThreeStringArray(anyString())).thenReturn(List.of("a", "b", "c"));

            insightService.getExpenseCuttingInsights(email);

            verify(lmStudioParser, times(1)).readThreeStringArray(anyString());
        }
    }
}
