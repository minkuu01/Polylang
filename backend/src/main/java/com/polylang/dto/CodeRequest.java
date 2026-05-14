package com.polylang.dto;

public class CodeRequest {
    private String instruction;
    private String targetLanguage;

    public CodeRequest() {}

    public CodeRequest(String instruction, String targetLanguage) {
        this.instruction = instruction;
        this.targetLanguage = targetLanguage;
    }

    public String getInstruction() { return instruction; }
    public void setInstruction(String instruction) { this.instruction = instruction; }

    public String getTargetLanguage() { return targetLanguage; }
    public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }
}
