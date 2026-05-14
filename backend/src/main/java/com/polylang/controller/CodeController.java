package com.polylang.controller;

import com.polylang.dto.*;
import com.polylang.model.ExecutionHistory;
import com.polylang.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
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

    public CodeController(TranslationService translationService,
                          CodeGenerationService codeGenerationService,
                          CodeExecutionService codeExecutionService,
                          HistoryService historyService) {
        this.translationService = translationService;
        this.codeGenerationService = codeGenerationService;
        this.codeExecutionService = codeExecutionService;
        this.historyService = historyService;
    }

    /**
     * POST /api/generate
     * Accepts a natural language instruction and target programming language.
     * Detects language, translates to English, generates code using AI.
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateCode(@RequestBody CodeRequest request) {
        log.info("Generate request: lang={}, instruction={}", request.getTargetLanguage(),
                request.getInstruction().substring(0, Math.min(50, request.getInstruction().length())));

        try {
            // Step 1: Detect language and translate to English
            TranslationService.TranslationResult translation =
                    translationService.detectAndTranslate(request.getInstruction());

            // Step 2: Generate code using AI
            String generatedCode = codeGenerationService.generateCode(
                    translation.getTranslatedText(),
                    request.getTargetLanguage()
            );

            // Step 3: Save to history
            ExecutionHistory history = new ExecutionHistory();
            history.setInputText(request.getInstruction());
            history.setDetectedLanguage(translation.getDetectedLanguage());
            history.setTranslatedText(translation.getTranslatedText());
            history.setTargetLanguage(request.getTargetLanguage());
            history.setGeneratedCode(generatedCode);
            history.setStatus("GENERATED");
            historyService.save(history);

            // Step 4: Build response
            CodeResponse response = new CodeResponse(
                    generatedCode,
                    translation.getDetectedLanguage(),
                    translation.getTranslatedText(),
                    request.getTargetLanguage()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Code generation failed: {}", e.getMessage(), e);
            String userMessage = e.getMessage() != null ? e.getMessage() : "Unknown error during code generation";
            return ResponseEntity.status(500).body(Map.of("message", userMessage));
        }
    }

    /**
     * POST /api/execute
     * Accepts code and language, executes via Piston API.
     */
    @PostMapping("/execute")
    public ResponseEntity<ExecutionResponse> executeCode(@RequestBody ExecutionRequest request) {
        log.info("Execute request: lang={}", request.getLanguage());

        long startTime = System.currentTimeMillis();
        
        // Execute the code
        CodeExecutionService.ExecutionResult result =
                codeExecutionService.execute(request.getCode(), request.getLanguage());

        long duration = System.currentTimeMillis() - startTime;

        // Save execution to history
        ExecutionHistory history = new ExecutionHistory();
        history.setInputText("Manual Execution");
        history.setTargetLanguage(request.getLanguage());
        history.setGeneratedCode(request.getCode()); // Save the actual code run
        history.setOutput(result.getOutput());
        history.setError(result.getError());
        history.setExecutionTime(duration);
        history.setStatus(result.getExitCode() == 0 ? "SUCCESS" : "ERROR");
        historyService.save(history);

        ExecutionResponse response = new ExecutionResponse(
                result.getOutput(),
                result.getError(),
                result.getExitCode()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/history
     * Returns the most recent 20 execution records.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ExecutionHistory>> getHistory() {
        return ResponseEntity.ok(historyService.getRecentHistory());
    }

    /**
     * DELETE /api/history
     * Clears all history records.
     */
    @DeleteMapping("/history")
    public ResponseEntity<Map<String, String>> clearHistory() {
        historyService.clearHistory();
        return ResponseEntity.ok(Map.of("message", "History cleared successfully"));
    }

    /**
     * GET /api/health
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "PolyLang"));
    }
}
