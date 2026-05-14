package com.polylang.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class CodeExecutionService {

    private static final Logger log = LoggerFactory.getLogger(CodeExecutionService.class);

    private final ObjectMapper objectMapper;
    private final WebClient webClient;
    private final String apiUrl;
    private final Map<String, LanguageConfig> languageMap = new HashMap<>();

    public CodeExecutionService(
            ObjectMapper objectMapper,
            WebClient webClient,
            @Value("${wandbox.api.url:https://wandbox.org/api/compile.json}") String apiUrl,
            @Value("${wandbox.language.python:python-3.10.9}") String pythonLang,
            @Value("${wandbox.language.javascript:nodejs-18.15.0}") String jsLang,
            @Value("${wandbox.language.java:openjdk-head}") String javaLang,
            @Value("${wandbox.language.cpp:gcc-head}") String cppLang,
            @Value("${wandbox.language.c:gcc-head}") String cLang
    ) {
        this.objectMapper = objectMapper;
        this.webClient = webClient;
        this.apiUrl = apiUrl;

        languageMap.put("python", new LanguageConfig(pythonLang, ""));
        languageMap.put("javascript", new LanguageConfig(jsLang, ""));
        languageMap.put("java", new LanguageConfig(javaLang, ""));
        languageMap.put("cpp", new LanguageConfig(cppLang, "warning,gnu++17"));
        languageMap.put("c", new LanguageConfig(cLang, "warning,gnu11"));
    }

    /**
     * Executes code using Wandbox API.
     */
    public ExecutionResult execute(String code, String language) {
        String lang = language == null ? "" : language.toLowerCase();
        LanguageConfig config = languageMap.get(lang);

        if (config == null) {
            return new ExecutionResult("", "Language not supported: " + language, 1);
        }

        if ("java".equals(lang)) {
            code = normalizeJavaForWandbox(code);
        }

        Map<String, Object> request = new HashMap<>();
        request.put("code", code);
        request.put("compiler", config.compiler);
        if (!config.options.isBlank()) {
            request.put("options", config.options);
        }
        request.put("stdin", "");

        try {
            String rawResponse = webClient.post()
                    .uri(apiUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(60));

            if (rawResponse == null || rawResponse.isBlank()) {
                return new ExecutionResult("", "Execution error: empty response from Wandbox", 1);
            }

            Map<String, Object> response;
            try {
                response = objectMapper.readValue(rawResponse, new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                log.error("Failed to parse Wandbox response: {}", e.getMessage(), e);
                return new ExecutionResult("", "Execution error: invalid response from Wandbox", 1);
            }

            String output = firstNonBlank(
                    toString(response.get("program_output")),
                    toString(response.get("program_message")),
                    toString(response.get("compiler_output")),
                    toString(response.get("compiler_message")),
                    toString(response.get("error"))
            );

            String compilerMessage = toString(response.get("compiler_message"));
            if (!compilerMessage.isBlank()) {
                return new ExecutionResult("", output.trim(), 1);
            }

            return new ExecutionResult(output.trim(), "", 0);

        } catch (WebClientResponseException e) {
            String body = e.getResponseBodyAsString();
            String message = body == null || body.isBlank() ? e.getMessage() : body;
            log.error("Wandbox API error: {}", message);
            return new ExecutionResult("", "Wandbox API error: " + message, 1);
        } catch (Exception e) {
            log.error("Code execution failed: {}", e.getMessage(), e);
            return new ExecutionResult("", "Execution error: " + e.getMessage(), 1);
        }
    }

    private static class LanguageConfig {
        String compiler;
        String options;

        LanguageConfig(String compiler, String options) {
            this.compiler = compiler;
            this.options = options == null ? "" : options;
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private String toString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String normalizeJavaForWandbox(String code) {
        if (code == null || code.isBlank()) {
            return code;
        }

        // If there's already a Main class, ensure it's not public to avoid filename mismatch.
        if (code.matches("(?s).*\\bclass\\s+Main\\b.*")) {
            return code.replaceFirst("(?m)^\\s*public\\s+class\\s+Main\\b", "class Main");
        }

        // Find a public class name.
        java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile("(?m)^\\s*public\\s+class\\s+([A-Za-z_][A-Za-z0-9_]*)\\b")
                .matcher(code);

        if (!matcher.find()) {
            return code;
        }

        String className = matcher.group(1);
        if ("Main".equals(className)) {
            return code;
        }

        // Only wrap if the class appears to define a main method.
        java.util.regex.Pattern mainPattern = java.util.regex.Pattern.compile(
                "(?s)class\\s+" + java.util.regex.Pattern.quote(className) + ".*?static\\s+void\\s+main\\s*\\(");
        if (!mainPattern.matcher(code).find()) {
            return code;
        }

        // Remove public from the top-level class to avoid filename mismatch.
        String updated = matcher.replaceFirst("class " + className);

        String wrapper = "\n\nclass Main {\n" +
                "    public static void main(String[] args) {\n" +
                "        " + className + ".main(args);\n" +
                "    }\n" +
                "}\n";

        return updated + wrapper;
    }

    /**
     * Result record for code execution.
     */
    public static class ExecutionResult {
        private final String output;
        private final String error;
        private final int exitCode;

        public ExecutionResult(String output, String error, int exitCode) {
            this.output = output;
            this.error = error;
            this.exitCode = exitCode;
        }

        public String getOutput() { return output; }
        public String getError() { return error; }
        public int getExitCode() { return exitCode; }
    }
}
