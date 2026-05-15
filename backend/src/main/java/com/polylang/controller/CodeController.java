package com.polylang.controller;

import com.polylang.dto.*;
import com.polylang.model.ExecutionHistory;
import com.polylang.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CodeController {

    private static final Logger log = LoggerFactory.getLogger(CodeController.class);

    private final TranslationService translationService;
    private final CodeGenerationService codeGenerationService;
    private final CodeExecutionService codeExecutionService;
    private final HistoryService historyService;
    private final TranscriptionService transcriptionService;

    public CodeController(TranslationService translationService,
                          CodeGenerationService codeGenerationService,
                          CodeExecutionService codeExecutionService,
                          HistoryService historyService,
                          TranscriptionService transcriptionService) {
        this.translationService = translationService;
        this.codeGenerationService = codeGenerationService;
        this.codeExecutionService = codeExecutionService;
        this.historyService = historyService;
        this.transcriptionService = transcriptionService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateCode(@RequestBody CodeRequest request, JwtAuthenticationToken token) {
        String userId = token.getName(); // Extract userId from JWT 'sub'
        log.info("Generate request from user {}: lang={}", userId, request.getTargetLanguage());

        try {
            TranslationService.TranslationResult translation =
                    translationService.detectAndTranslate(request.getInstruction());

            String generatedCode = codeGenerationService.generateCode(
                    translation.getTranslatedText(),
                    request.getTargetLanguage()
            );

            ExecutionHistory history = new ExecutionHistory();
            history.setUserId(userId);
            history.setInputText(request.getInstruction());
            history.setDetectedLanguage(translation.getDetectedLanguage());
            history.setTranslatedText(translation.getTranslatedText());
            history.setTargetLanguage(request.getTargetLanguage());
            history.setGeneratedCode(generatedCode);
            history.setStatus("GENERATED");
            historyService.save(history);

            CodeResponse response = new CodeResponse(
                    generatedCode,
                    translation.getDetectedLanguage(),
                    translation.getTranslatedText(),
                    request.getTargetLanguage()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Code generation failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/execute")
    public ResponseEntity<ExecutionResponse> executeCode(@RequestBody ExecutionRequest request, JwtAuthenticationToken token) {
        String userId = token.getName();
        log.info("Execute request from user {}: lang={}", userId, request.getLanguage());

        long startTime = System.currentTimeMillis();
        CodeExecutionService.ExecutionResult result =
                codeExecutionService.execute(request.getCode(), request.getLanguage());
        long duration = System.currentTimeMillis() - startTime;

        // Save execution log
        ExecutionHistory history = new ExecutionHistory();
        history.setUserId(userId);
        history.setInputText("Manual Execution");
        history.setTargetLanguage(request.getLanguage());
        history.setGeneratedCode(request.getCode());
        history.setOutput(result.getOutput());
        history.setError(result.getError());
        history.setExecutionTime(duration);
        history.setStatus(result.getExitCode() == 0 ? "SUCCESS" : "ERROR");
        historyService.save(history);

        return ResponseEntity.ok(new ExecutionResponse(result.getOutput(), result.getError(), result.getExitCode()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ExecutionHistory>> getHistory(JwtAuthenticationToken token) {
        return ResponseEntity.ok(historyService.getRecentHistory(token.getName()));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Map<String, String>> clearHistory(JwtAuthenticationToken token) {
        historyService.clearHistory(token.getName());
        return ResponseEntity.ok(Map.of("message", "History cleared successfully"));
    }

    @PostMapping(value = "/transcribe", consumes = "multipart/form-data")
    public ResponseEntity<?> transcribeAudio(@RequestParam("audio") org.springframework.web.multipart.MultipartFile audio,
                                             JwtAuthenticationToken token) {
        log.info("Transcription request from user {}: file={}, size={}",
                token.getName(), audio.getOriginalFilename(), audio.getSize());

        try {
            return ResponseEntity.ok(transcriptionService.transcribe(audio));
        } catch (Exception e) {
            log.error("Audio transcription failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * DELETE /api/history/{id}
     * Delete a single history record.
     */
    @DeleteMapping("/history/{id}")
    public ResponseEntity<Map<String, String>> deleteHistoryItem(@PathVariable Long id, JwtAuthenticationToken token) {
        historyService.deleteById(id, token.getName());
        return ResponseEntity.ok(Map.of("message", "Item deleted"));
    }

    /**
     * PUT /api/history/{id}
     * Update an existing code snippet (Save Project).
     */
    @PutMapping("/history/{id}")
    public ResponseEntity<?> updateHistoryItem(@PathVariable Long id, @RequestBody Map<String, String> body, JwtAuthenticationToken token) {
        ExecutionHistory history = historyService.getById(id);
        if (history == null || !history.getUserId().equals(token.getName())) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        
        if (body.containsKey("code")) history.setGeneratedCode(body.get("code"));
        if (body.containsKey("status")) history.setStatus(body.get("status"));
        
        historyService.save(history);
        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/share/{id}
     * Publicly view a shared code snippet (No Auth Required - see SecurityConfig).
     */
    @GetMapping("/share/{id}")
    public ResponseEntity<?> getSharedItem(@PathVariable Long id) {
        ExecutionHistory history = historyService.getById(id);
        if (history == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(history);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "PolyLang"));
    }
}
