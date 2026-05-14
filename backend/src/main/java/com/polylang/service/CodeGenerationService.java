package com.polylang.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
public class CodeGenerationService {

    private static final Logger log = LoggerFactory.getLogger(CodeGenerationService.class);

    // Max number of fix attempts after initial generation
    private static final int MAX_FIX_ATTEMPTS = 2;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String groqApiKey;
    private final String groqApiUrl;
    private final String groqModel;
    private final int maxRetries;
    private final long retryDelayMs;

    public CodeGenerationService(WebClient webClient,
                                  ObjectMapper objectMapper,
                                  @Value("${groq.api.key}") String groqApiKey,
                                  @Value("${groq.api.url}") String groqApiUrl,
                                  @Value("${groq.api.model}") String groqModel,
                                  @Value("${groq.max.retries:3}") int maxRetries,
                                  @Value("${groq.retry.delay.ms:2000}") long retryDelayMs) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
        this.groqApiKey = groqApiKey;
        this.groqApiUrl = groqApiUrl;
        this.groqModel = groqModel;
        this.maxRetries = maxRetries;
        this.retryDelayMs = retryDelayMs;
    }

    /**
     * Generates code, then validates it. If validation finds issues,
     * asks the model to fix them — up to MAX_FIX_ATTEMPTS times.
     */
    public String generateCode(String instruction, String targetLanguage) {
        // Step 1: Generate initial code
        String raw = callGroq(buildSystemPrompt(targetLanguage),
                              buildUserPrompt(instruction, targetLanguage));
        log.info("Raw model output (first 200 chars): [{}]",
                 raw.substring(0, Math.min(200, raw.length())).replace("\n", "\\n"));
        String code = sanitize(raw);

        log.info("Initial generation complete ({} chars)", code.length());
        log.info("Sanitized output (first 200 chars): [{}]",
                 code.substring(0, Math.min(200, code.length())).replace("\n", "\\n"));

        // Step 2: Validate and fix loop
        for (int attempt = 0; attempt < MAX_FIX_ATTEMPTS; attempt++) {
            List<String> issues = validate(code, targetLanguage);
            if (issues.isEmpty()) {
                log.info("Code passed validation on attempt {}", attempt);
                return code;
            }

            log.warn("Validation found {} issue(s) on attempt {}: {}", issues.size(), attempt, issues);

            // Ask the model to fix its own code
            String fixPrompt = buildFixPrompt(code, targetLanguage, issues);
            String fixed = callGroq(buildSystemPrompt(targetLanguage), fixPrompt);
            code = sanitize(fixed);
        }

        // Final validation — return best effort even if issues remain
        List<String> remaining = validate(code, targetLanguage);
        if (!remaining.isEmpty()) {
            log.warn("Code still has issues after {} fix attempts: {}", MAX_FIX_ATTEMPTS, remaining);
        }
        return code;
    }

    // ─── Groq API call ────────────────────────────────────────────────────────

    private String callGroq(String systemPrompt, String userPrompt) {
        return callWithRetry(() -> {
            try {
                Map<String, Object> requestBody = new LinkedHashMap<>();
                requestBody.put("model", groqModel);
                requestBody.put("temperature", 0.1);
                requestBody.put("max_tokens", 2048);

                List<Map<String, String>> messages = new ArrayList<>();
                messages.add(Map.of("role", "system", "content", systemPrompt));

                // Few-shot examples so the model sees exactly what format is expected
                messages.addAll(buildFewShotExamples());

                messages.add(Map.of("role", "user", "content", userPrompt));
                requestBody.put("messages", messages);

                String jsonBody = objectMapper.writeValueAsString(requestBody);

                JsonNode response = webClient.post()
                        .uri(groqApiUrl)
                        .header("Authorization", "Bearer " + groqApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(jsonBody)
                        .retrieve()
                        .bodyToMono(JsonNode.class)
                        .block();

                if (response != null && response.has("choices")) {
                    return response.path("choices").get(0)
                            .path("message").path("content").asText("");
                }
                throw new RuntimeException("Empty response from Groq API");

            } catch (Exception e) {
                log.error("Groq API call failed: {}", e.getMessage());
                throw new RuntimeException(e);
            }
        });
    }

    /**
     * Few-shot examples showing the model exactly what output format is expected:
     * raw code only, no markdown, no input(), hardcoded values.
     */
    private List<Map<String, String>> buildFewShotExamples() {
        List<Map<String, String>> examples = new ArrayList<>();

        // Example 1: simple Python with explanatory comments
        examples.add(Map.of("role", "user",
            "content", "Write python code for the following instruction:\n\nprint hello world"));
        examples.add(Map.of("role", "assistant",
            "content",
            "# Program: prints a greeting message to the console\n" +
            "print(\"Hello, World!\")"));

        // Example 2: function with hardcoded values and block-level comments
        examples.add(Map.of("role", "user",
            "content", "Write python code for the following instruction:\n\nadd two numbers"));
        examples.add(Map.of("role", "assistant",
            "content",
            "# Program: demonstrates adding two numbers using a reusable function\n\n" +
            "# Defines a function that takes two numbers and returns their sum.\n" +
            "# Using a function makes the logic reusable and easy to test.\n" +
            "def add(a, b):\n" +
            "    # Add the two arguments and return the result to the caller\n" +
            "    return a + b\n\n" +
            "# Hardcoded example values to demonstrate the function\n" +
            "x = 10\n" +
            "y = 20\n\n" +
            "# Call the function and store the result for display\n" +
            "result = add(x, y)\n\n" +
            "# Print the final result so the user can verify the output\n" +
            "print(\"Sum:\", result)"));

        return examples;
    }

    // ─── Prompts ──────────────────────────────────────────────────────────────

    private String buildSystemPrompt(String targetLanguage) {
        return "You are a code-only output machine for " + targetLanguage + ".\n" +
               "RULES (all mandatory):\n" +
               "1. Output ONLY raw source code — no prose, no explanations outside of comments.\n" +
               "2. Do NOT restate or echo the instruction.\n" +
               "3. Do NOT use markdown fences (``` or ~~~).\n" +
               "4. First character of output must be valid " + targetLanguage + " syntax.\n" +
               "5. Code must be complete, runnable, and self-contained.\n" +
               "6. Use ONLY straight ASCII quotes (\" and ') — never curly quotes.\n" +
               "7. Do NOT use input() or stdin — hardcode representative example values.\n" +
               "8. All identifiers, comments, and strings must be in English.\n" +
               "9. Ensure all string literals are properly closed.\n" +
               "10. Ensure all brackets, parentheses, and braces are balanced.\n" +
               "11. Add a comment above EVERY logical block explaining WHY it exists and WHAT it does.\n" +
               "    - Before function/class definitions: explain the purpose and what it returns.\n" +
               "    - Before loops: explain what is being iterated and why.\n" +
               "    - Before conditionals: explain what condition is being checked and why.\n" +
               "    - Before key variable assignments: explain what the variable holds.\n" +
               "    - At the top of the file: a 1-2 line summary of what the program does.\n" +
               "    Comments must be meaningful — never just restate the code syntax.\n";
    }

    private String buildUserPrompt(String instruction, String targetLanguage) {
        return "Write " + targetLanguage + " code that does the following:\n\n" + instruction;
    }

    private String buildFixPrompt(String brokenCode, String targetLanguage, List<String> issues) {
        StringBuilder sb = new StringBuilder();
        sb.append("The following ").append(targetLanguage).append(" code has issues that must be fixed:\n\n");
        sb.append(brokenCode).append("\n\n");
        sb.append("Issues found:\n");
        for (String issue : issues) {
            sb.append("- ").append(issue).append("\n");
        }
        sb.append("\nReturn ONLY the corrected ").append(targetLanguage)
          .append(" source code with all issues fixed. No explanations.");
        return sb.toString();
    }

    // ─── Sanitization ─────────────────────────────────────────────────────────

    /**
     * Cleans raw model output: strips markdown fences and curly quotes.
     * Does NOT attempt to strip leading lines — that causes partial-line truncation.
     */
    private String sanitize(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return "# Error: Empty response from AI model";
        }

        String code = raw.trim();

        // Strip markdown code fences  (```python\n...\n``` or ```\n...\n```)
        if (code.startsWith("```")) {
            int firstNewline = code.indexOf('\n');
            if (firstNewline != -1) code = code.substring(firstNewline + 1);
            int lastFence = code.lastIndexOf("```");
            if (lastFence > 0) code = code.substring(0, lastFence);
            code = code.trim();
        }

        // Replace curly/smart quotes with straight ASCII quotes
        code = code
            .replace('\u201C', '"').replace('\u201D', '"')   // " "
            .replace('\u2018', '\'').replace('\u2019', '\'') // ' '
            .replace('\u00AB', '"').replace('\u00BB', '"')   // « »
            .replace('\u2039', '\'').replace('\u203A', '\'');// ‹ ›

        return code.trim();
    }

    // ─── Validation ───────────────────────────────────────────────────────────

    /**
     * Runs lightweight static checks on the generated code.
     * Returns a list of human-readable issue descriptions (empty = clean).
     */
    private List<String> validate(String code, String language) {
        List<String> issues = new ArrayList<>();

        if (code == null || code.trim().isEmpty()) {
            issues.add("Code is empty");
            return issues;
        }

        // Universal checks
        checkUnbalancedBrackets(code, issues);
        checkUnterminatedStrings(code, language, issues);
        checkCurlyQuotes(code, issues);

        // Language-specific checks
        switch (language.toLowerCase()) {
            case "python" -> validatePython(code, issues);
            case "javascript" -> validateJavaScript(code, issues);
            case "java" -> validateJava(code, issues);
            case "cpp", "c" -> validateCpp(code, issues);
        }

        return issues;
    }

    private void checkUnbalancedBrackets(String code, List<String> issues) {
        // Skip bracket checks inside string literals (simplified)
        int parens = 0, braces = 0, brackets = 0;
        boolean inSingleQuote = false, inDoubleQuote = false;
        for (int i = 0; i < code.length(); i++) {
            char c = code.charAt(i);
            char prev = i > 0 ? code.charAt(i - 1) : 0;
            if (c == '\'' && !inDoubleQuote && prev != '\\') inSingleQuote = !inSingleQuote;
            if (c == '"'  && !inSingleQuote && prev != '\\') inDoubleQuote = !inDoubleQuote;
            if (inSingleQuote || inDoubleQuote) continue;
            if (c == '(') parens++;   else if (c == ')') parens--;
            if (c == '{') braces++;   else if (c == '}') braces--;
            if (c == '[') brackets++; else if (c == ']') brackets--;
        }
        if (parens != 0)   issues.add("Unbalanced parentheses (net " + parens + ")");
        if (braces != 0)   issues.add("Unbalanced curly braces (net " + braces + ")");
        if (brackets != 0) issues.add("Unbalanced square brackets (net " + brackets + ")");
    }

    private void checkUnterminatedStrings(String code, String language, List<String> issues) {
        // Check each line for unterminated single-line strings
        String[] lines = code.split("\n");
        for (int lineNum = 0; lineNum < lines.length; lineNum++) {
            String line = lines[lineNum];
            // Skip comment lines
            String trimmed = line.trim();
            if (trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("*")) continue;

            int doubleCount = 0, singleCount = 0;
            boolean escaped = false;
            for (char c : line.toCharArray()) {
                if (escaped) { escaped = false; continue; }
                if (c == '\\') { escaped = true; continue; }
                if (c == '"') doubleCount++;
                if (c == '\'') singleCount++;
            }
            // Odd number of unescaped quotes = unterminated string
            if (doubleCount % 2 != 0) {
                issues.add("Unterminated double-quoted string on line " + (lineNum + 1));
            }
            // For Python, single quotes in contractions can cause false positives — skip
            if (!"python".equalsIgnoreCase(language) && singleCount % 2 != 0) {
                issues.add("Unterminated single-quoted string on line " + (lineNum + 1));
            }
        }
    }

    private void checkCurlyQuotes(String code, List<String> issues) {
        if (code.contains("\u201C") || code.contains("\u201D") ||
            code.contains("\u2018") || code.contains("\u2019")) {
            issues.add("Contains curly/smart quotes that will cause syntax errors");
        }
    }

    private void validatePython(String code, List<String> issues) {
        // Check for common Python-specific issues
        String[] lines = code.split("\n");
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;

            // Detect prose lines that leaked into code (no Python syntax)
            if (i == 0 && !isCodeLine(trimmed)) {
                issues.add("First line looks like prose, not Python code: \"" + trimmed + "\"");
            }

            // Detect input() usage (blocks Wandbox)
            if (trimmed.contains("input(")) {
                issues.add("Line " + (i+1) + " uses input() which blocks sandbox execution");
            }
        }

        // Must have at least one function/class/statement
        if (!code.contains("def ") && !code.contains("class ") &&
            !code.contains("print") && !code.contains("=")) {
            issues.add("Code appears to contain no executable Python statements");
        }
    }

    private void validateJavaScript(String code, List<String> issues) {
        if (!code.contains("function ") && !code.contains("=>") &&
            !code.contains("const ") && !code.contains("let ") && !code.contains("var ")) {
            issues.add("Code appears to contain no JavaScript declarations");
        }
        if (code.contains("readline") || code.contains("prompt(")) {
            issues.add("Code uses interactive input which blocks sandbox execution");
        }
    }

    private void validateJava(String code, List<String> issues) {
        if (!code.contains("class ")) {
            issues.add("Java code must contain at least one class declaration");
        }
        if (!code.contains("public static void main")) {
            issues.add("Java code must contain a main method");
        }
        if (code.contains("Scanner") && code.contains("System.in")) {
            issues.add("Code uses Scanner with System.in which blocks sandbox execution");
        }
    }

    private void validateCpp(String code, List<String> issues) {
        if (!code.contains("int main")) {
            issues.add("C/C++ code must contain a main function");
        }
        if (!code.contains("#include")) {
            issues.add("C/C++ code is missing #include directives");
        }
        if (code.contains("cin >>") || code.contains("scanf(")) {
            issues.add("Code uses stdin input which blocks sandbox execution");
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private <T> T callWithRetry(java.util.function.Supplier<T> call) {
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return call.get();
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    log.warn("API call failed, retrying ({}/{}): {}", attempt + 1, maxRetries, e.getMessage());
                    try { Thread.sleep(retryDelayMs * (attempt + 1)); }
                    catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                } else {
                    throw e;
                }
            }
        }
        throw new RuntimeException("Max retries exceeded");
    }

    private boolean isCodeLine(String line) {
        if (line.isEmpty()) return false;
        char first = line.charAt(0);
        if (first == '#' || first == '/' || first == '{' || first == '}'
                || first == '(' || first == '@' || first == '<'
                || first == '"' || first == '\'' || first == '`'
                || Character.isDigit(first)) {
            return true;
        }
        String[] keywords = {
            "def ", "class ", "import ", "from ", "public ", "private ", "protected ",
            "static ", "void ", "int ", "long ", "double ", "float ", "bool ",
            "string ", "var ", "let ", "const ", "function ", "func ", "fn ",
            "return ", "if ", "else", "for ", "while ", "print(", "print ",
            "System.", "cout", "printf", "#include", "package ", "using ",
            "module ", "export "
        };
        String lower = line.toLowerCase();
        for (String kw : keywords) {
            if (lower.startsWith(kw.toLowerCase())) return true;
        }
        return line.contains(" = ") || line.contains("(") || line.contains("->")
               || line.contains("::") || line.contains("=>");
    }
}
