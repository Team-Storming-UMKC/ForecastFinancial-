package edu.umkc.teamstorming.bank_api.ai;

import edu.umkc.teamstorming.bank_api.dto.ExtractedFinancialEntitiesDto;
import edu.umkc.teamstorming.bank_api.dto.TextExtractRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiClientService aiClientService;
    private final LmStudioParser lmStudioParser;

    public AiController(AiClientService aiClientService, LmStudioParser lmStudioParser) {
        this.aiClientService = aiClientService;
        this.lmStudioParser = lmStudioParser;
    }

    @GetMapping("/ping")
    public String ping() {
        return aiClientService.ping();
    }

    /**
     * Extract financial transaction details from raw user text.
     *
     * @param request contains the raw text from the user
     * @return structured financial entity data
     */
    @PostMapping("/extract")
    public ExtractedFinancialEntitiesDto extractFinancialEntities(@RequestBody TextExtractRequest request) {
        // 1. Call AI service with system prompt to get JSON response
        String aiJsonContent = aiClientService.extractFinancialEntities(request.getText());

        // 2. Parse the AI's JSON response into our DTO
        return lmStudioParser.readEntitiesJson(aiJsonContent);
    }
}
