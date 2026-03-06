package edu.umkc.teamstorming.bank_api.data;


import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DataExtractService {

    public Map<String, Object> extract(String rawText) {
        Map<String, Object> out = new HashMap<>();
        out.put("length", rawText == null ? 0 : rawText.length());
        out.put("preview", rawText == null ? "" : rawText.substring(0, Math.min(60, rawText.length())));
        return out;
    }
}
