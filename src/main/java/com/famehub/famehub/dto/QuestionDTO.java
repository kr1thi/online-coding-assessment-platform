package com.famehub.famehub.dto;

public class QuestionDTO {
    private Long id;
    private String title;
    private String description;
    private String exampleInput;
    private String exampleOutput;
    private String options;
    private String type;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public void setExampleInput(String exampleInput) {
        this.exampleInput = exampleInput;
    }

    public void setExampleOutput(String exampleOutput) {
        this.exampleOutput = exampleOutput;
    }
    
    public String getExampleInput() { return exampleInput; }
    public String getExampleOutput() { return exampleOutput; }
    public String getOptions() {
        return options;
    }

    public void setOptions(String options) {
        this.options = options;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
}