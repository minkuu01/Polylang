package com.polylang.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.polylang.dto.TranscriptionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

@Service
public class TranscriptionService {

    private final WebClient webClient;
    private final String groqApiKey;
    private final String transcriptionUrl;
    private final String transcriptionModel;

    public TranscriptionService(WebClient webClient,
                                @Value("${groq.api.key}") String groqApiKey,
                                @Value("${groq.audio.transcription.url}") String transcriptionUrl,
                                @Value("${groq.audio.transcription.model}") String transcriptionModel) {
        this.webClient = webClient;
        this.groqApiKey = groqApiKey;
        this.transcriptionUrl = transcriptionUrl;
        this.transcriptionModel = transcriptionModel;
    }

    public TranscriptionResponse transcribe(MultipartFile audio) {
        if (audio == null || audio.isEmpty()) {
            throw new IllegalArgumentException("Audio file is required");
        }

        try {
            ByteArrayResource audioResource = new ByteArrayResource(audio.getBytes()) {
                @Override
                public String getFilename() {
                    String original = audio.getOriginalFilename();
                    return original == null || original.isBlank() ? "prompt-audio.webm" : original;
                }
            };

            MultiValueMap<String, Object> multipart = new LinkedMultiValueMap<>();
            multipart.add("file", audioResource);
            multipart.add("model", transcriptionModel);
            multipart.add("response_format", "verbose_json");
            multipart.add("temperature", "0");

            JsonNode response = webClient.post()
                    .uri(transcriptionUrl)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(multipart))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response == null) {
                throw new RuntimeException("Empty response from transcription service");
            }

            String text = response.path("text").asText("").trim();
            String language = response.path("language").asText("");
            if (text.isEmpty()) {
                throw new RuntimeException("No speech was detected in the recording");
            }

            return new TranscriptionResponse(text, language);
        } catch (IOException e) {
            throw new RuntimeException("Could not read audio recording", e);
        }
    }
}
