package edu.umkc.teamstorming.bank_api.DataTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.umkc.teamstorming.bank_api.data.DataController;
import edu.umkc.teamstorming.bank_api.data.DataExtractService;
import edu.umkc.teamstorming.bank_api.dto.TextExtractRequest;
import edu.umkc.teamstorming.bank_api.dto.TextExtractResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DataController")
class DataControllerTest {

    @Mock
    private DataExtractService dataExtractService;

    @InjectMocks
    private DataController dataController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(dataController).build();
        objectMapper = new ObjectMapper();
    }

    // -------------------------------------------------------------------------
    // JSON endpoint — POST /api/data/extract (application/json)
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /api/data/extract — JSON")
    class JsonExtract {

        @Test
        @DisplayName("returns 200 with extracted fields for a valid JSON request")
        void returns200WithExtractedFields() throws Exception {
            String inputText = "Transfer $500 to account 12345";
            Map<String, Object> extracted = Map.of("amount", 500, "account", "12345");
            when(dataExtractService.extract(inputText)).thenReturn(extracted);

            TextExtractRequest request = new TextExtractRequest();
            request.setText(inputText);

            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.rawText").value(inputText))
                    .andExpect(jsonPath("$.extracted.amount").value(500))
                    .andExpect(jsonPath("$.extracted.account").value("12345"));

            verify(dataExtractService, times(1)).extract(inputText);
        }

        @Test
        @DisplayName("returns 200 with empty extracted map when service returns nothing")
        void returns200WhenServiceReturnsEmptyMap() throws Exception {
            String inputText = "No structured data here";
            when(dataExtractService.extract(inputText)).thenReturn(Collections.emptyMap());

            TextExtractRequest request = new TextExtractRequest();
            request.setText(inputText);

            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rawText").value(inputText))
                    .andExpect(jsonPath("$.extracted").isEmpty());

            verify(dataExtractService).extract(inputText);
        }

        @Test
        @DisplayName("passes raw text to the service unchanged")
        void passesRawTextToServiceUnchanged() throws Exception {
            String inputText = "  leading and trailing spaces  ";
            when(dataExtractService.extract(inputText)).thenReturn(Collections.emptyMap());

            TextExtractRequest request = new TextExtractRequest();
            request.setText(inputText);

            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rawText").value(inputText));

            verify(dataExtractService).extract(inputText);
        }

        @Test
        @DisplayName("returns 400 when request body is missing the text field (Bean Validation)")
        void returns400WhenTextFieldMissing() throws Exception {
            // Send an empty JSON object — @Valid should reject it
            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(dataExtractService);
        }

        @Test
        @DisplayName("returns 400 when request body is empty")
        void returns400WhenBodyIsEmpty() throws Exception {
            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(""))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(dataExtractService);
        }

        @Test
        @DisplayName("does not call service more than once per request")
        void callsServiceExactlyOnce() throws Exception {
            String inputText = "some text";
            when(dataExtractService.extract(inputText)).thenReturn(Map.of("key", "value"));

            TextExtractRequest request = new TextExtractRequest();
            request.setText(inputText);

            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            verify(dataExtractService, times(1)).extract(anyString());
        }
    }

    // -------------------------------------------------------------------------
    // Plain-text endpoint — POST /api/data/extract (text/plain)
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("POST /api/data/extract — plain text")
    class PlainTextExtract {

        @Test
        @DisplayName("returns 200 with extracted fields for a valid plain-text request")
        void returns200WithExtractedFields() throws Exception {
            String inputText = "Deposit $200 from savings";
            Map<String, Object> extracted = Map.of("action", "deposit", "amount", 200);
            when(dataExtractService.extract(inputText)).thenReturn(extracted);

            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.TEXT_PLAIN)
                            .content(inputText))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.rawText").value(inputText))
                    .andExpect(jsonPath("$.extracted.action").value("deposit"))
                    .andExpect(jsonPath("$.extracted.amount").value(200));

            verify(dataExtractService).extract(inputText);
        }

        @Test
        @DisplayName("returns 200 with empty extracted map when service returns nothing")
        void returns200WhenServiceReturnsEmptyMap() throws Exception {
            String inputText = "unrecognised text";
            when(dataExtractService.extract(inputText)).thenReturn(Collections.emptyMap());

            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.TEXT_PLAIN)
                            .content(inputText))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rawText").value(inputText))
                    .andExpect(jsonPath("$.extracted").isEmpty());
        }

        @Test
        @DisplayName("handles multi-line plain text body")
        void handlesMultiLineBody() throws Exception {
            String inputText = "Line one\nLine two\nLine three";
            when(dataExtractService.extract(inputText)).thenReturn(Collections.emptyMap());

            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.TEXT_PLAIN)
                            .content(inputText))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rawText").value(inputText));

            verify(dataExtractService).extract(inputText);
        }

        @Test
        @DisplayName("does not call service more than once per request")
        void callsServiceExactlyOnce() throws Exception {
            String inputText = "another text";
            when(dataExtractService.extract(inputText)).thenReturn(Map.of());

            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.TEXT_PLAIN)
                            .content(inputText))
                    .andExpect(status().isOk());

            verify(dataExtractService, times(1)).extract(anyString());
        }
    }

    // -------------------------------------------------------------------------
    // Content-negotiation / routing
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("Content-type routing")
    class ContentTypeRouting {

        @Test
        @DisplayName("routes application/json to the JSON handler")
        void routesJsonContentType() throws Exception {
            String text = "json route";
            when(dataExtractService.extract(text)).thenReturn(Map.of());

            TextExtractRequest req = new TextExtractRequest();
            req.setText(text);

            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rawText").value(text));
        }

        @Test
        @DisplayName("routes text/plain to the plain-text handler")
        void routesPlainTextContentType() throws Exception {
            String text = "plain text route";
            when(dataExtractService.extract(text)).thenReturn(Map.of());

            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.TEXT_PLAIN)
                            .content(text))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rawText").value(text));
        }

        @Test
        @DisplayName("returns 415 Unsupported Media Type for an unrecognised content type")
        void returns415ForUnsupportedContentType() throws Exception {
            mockMvc.perform(post("/api/data/extract")
                            .contentType(MediaType.APPLICATION_XML)
                            .content("<text>hello</text>"))
                    .andExpect(status().isUnsupportedMediaType());

            verifyNoInteractions(dataExtractService);
        }
    }
}