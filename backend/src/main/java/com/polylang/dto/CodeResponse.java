package com.polylang.dto;

public class CodeResponse {
    private String generatedCode;
    private String detectedLanguage;
    private String translatedInstruction;
    private String targetLanguage;

    public CodeResponse() {}

    public CodeResponse(String generatedCode, String detectedLanguage, String translatedInstruction, String targetLanguage) {
        this.generatedCode = generatedCode;
        this.detectedLanguage = detectedLanguage;
        this.translatedInstruction = translatedInstruction;
        this.targetLanguage = targetLanguage;
    }

    public String getGeneratedCode() { return generatedCode; }
    public void setGeneratedCode(String generatedCode) { this.generatedCode = generatedCode; }

    public String getDetectedLanguage() { return detectedLanguage; }
    public void setDetectedLanguage(String detectedLanguage) { this.detectedLanguage = detectedLanguage; }

    public String getTranslatedInstruction() { return translatedInstruction; }
    public void setTranslatedInstruction(String translatedInstruction) { this.translatedInstruction = translatedInstruction; }

    public String getTargetLanguage() { return targetLanguage; }
    public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }
}
