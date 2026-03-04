package edu.umkc.teamstorming.bank_api.data;


import edu.umkc.teamstorming.bank_api.dto.TextExtractRequest;
import edu.umkc.teamstorming.bank_api.dto.TextExtractResponse;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/data")
public class DataController {

    private final DataExtractService dataExtractService;

    public DataController(DataExtractService dataExtractService) {
        this.dataExtractService = dataExtractService;
    }

    // JSON: { "text": "..." }
    @PostMapping(
            value = "/extract",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public TextExtractResponse extractJson(@Valid @RequestBody TextExtractRequest request) {
        String rawText = request.getText();
        Map<String, Object> extracted = dataExtractService.extract(rawText);
        return new TextExtractResponse(rawText, extracted);
    }

    // Plain text: Content-Type: text/plain
    @PostMapping(
            value = "/extract",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public TextExtractResponse extractPlain(@RequestBody String rawText) {
        Map<String, Object> extracted = dataExtractService.extract(rawText);
        return new TextExtractResponse(rawText, extracted);
    }
}