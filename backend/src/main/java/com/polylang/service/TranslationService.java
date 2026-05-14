package com.polylang.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Service
public class TranslationService {

    private static final Logger log = LoggerFactory.getLogger(TranslationService.class);

    private final WebClient webClient;
    private final String translationApiUrl;
    private final String userEmail;
    private final Map<String, TranslationResult> cache = new HashMap<>();

    public TranslationService(WebClient webClient,
                               @Value("${translation.api.url}") String translationApiUrl,
                               @Value("${mymemory.email}") String userEmail) {
        this.webClient = webClient;
        this.translationApiUrl = translationApiUrl;
        this.userEmail = userEmail;
    }

    /** Returns true if the text is pure ASCII (likely English). */
    private boolean isLikelyEnglish(String text) {
        return text.matches("[\\x00-\\x7F]+");
    }

    /**
     * Detects the language of inputText and translates it to English if needed.
     * Uses MyMemory Translation API (free, no key required).
     */
    public TranslationResult detectAndTranslate(String inputText) {
        if (cache.containsKey(inputText)) {
            return cache.get(inputText);
        }

        // Fast path: pure ASCII → treat as English, skip API call
        if (isLikelyEnglish(inputText)) {
            return new TranslationResult("en", inputText);
        }

        try {
            // Build URI properly so WebClient does NOT double-encode the query params.
            // UriComponentsBuilder.build(true) marks the URI as already encoded,
            // preventing WebClient from encoding it a second time.
            URI uri = UriComponentsBuilder
                    .fromHttpUrl(translationApiUrl)
                    .queryParam("q", inputText)          // raw text — Spring encodes once
                    .queryParam("langpair", "autodetect|en")
                    .queryParam("de", userEmail)
                    .encode()                             // encode exactly once here
                    .build()
                    .toUri();

            log.debug("Translation URI: {}", uri);

            JsonNode response = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response == null || !response.has("responseData")) {
                log.warn("MyMemory returned no responseData");
                return new TranslationResult("en", inputText);
            }

            String translatedText = response.path("responseData").path("translatedText").asText(inputText);
            String detectedLang   = extractDetectedLanguage(response);

            log.info("MyMemory → detected: {}, translated: {}", detectedLang, translatedText);

            // If detection failed or result is English, return original
            if ("en".equalsIgnoreCase(detectedLang) || translatedText.equalsIgnoreCase(inputText)) {
                return new TranslationResult("en", inputText);
            }

            TranslationResult result = new TranslationResult(detectedLang, translatedText);
            cache.put(inputText, result);
            return result;

        } catch (Exception e) {
            log.error("Translation failed, falling back to original text: {}", e.getMessage());
            return new TranslationResult("en", inputText);
        }
    }

    /**
     * Extracts the detected source language code from a MyMemory API response.
     * MyMemory returns language in matches[].language as "hi" or "hi-IN".
     */
    private String extractDetectedLanguage(JsonNode response) {
        try {
            JsonNode matches = response.path("matches");
            if (matches.isArray()) {
                for (JsonNode m : matches) {
                    String lang = m.path("language").asText("").trim();
                    if (!lang.isEmpty() && !lang.equalsIgnoreCase("false") && !lang.equalsIgnoreCase("null")) {
                        // Normalise "hi-IN" → "hi"
                        return lang.contains("-") ? lang.split("-")[0] : lang;
                    }
                }
            }
            // Secondary fallback: responseData.detectedLanguage (not always present)
            String dl = response.path("responseData").path("detectedLanguage").asText("").trim();
            if (!dl.isEmpty() && !dl.equalsIgnoreCase("false")) {
                return dl.contains("-") ? dl.split("-")[0] : dl;
            }
        } catch (Exception e) {
            log.warn("Could not extract detected language: {}", e.getMessage());
        }
        return "en";
    }

    // ── Result ────────────────────────────────────────────────────────────────

    public static class TranslationResult {
        private final String detectedLanguage;
        private final String translatedText;

        public TranslationResult(String detectedLanguage, String translatedText) {
            this.detectedLanguage = detectedLanguage;
            this.translatedText   = translatedText;
        }

        public String getDetectedLanguage() { return detectedLanguage; }
        public String getTranslatedText()   { return translatedText; }
    }
}
