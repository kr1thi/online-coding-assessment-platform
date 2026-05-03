package com.famehub.famehub.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;

@Entity
@Table(name = "assessment_questions")
@JsonInclude(JsonInclude.Include.ALWAYS)
public class AssessmentQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    private String type; 

    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(columnDefinition = "TEXT")
    private String template; 

    @Column(name = "correct_answer")
    private String correctAnswer;

    @Column(name = "example_input", columnDefinition = "TEXT")
    private String exampleInput;

    @Column(name = "example_output", columnDefinition = "TEXT")
    private String exampleOutput;
    private String language; 
    @Column(name = "test_cases", columnDefinition = "TEXT") 
    private String testCases;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id")
    @JsonBackReference 
    private Assessment assessment;

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getOptions() { return options; }
    public void setOptions(String options) { this.options = options; }
    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public String getExampleInput() { return exampleInput; }
    public void setExampleInput(String exampleInput) { this.exampleInput = exampleInput; }
    public String getExampleOutput() { return exampleOutput; }
    public void setExampleOutput(String exampleOutput) { this.exampleOutput = exampleOutput; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getTestCases() { return testCases; }
    public void setTestCases(String testCases) { this.testCases = testCases; }
    public Assessment getAssessment() { return assessment; }
    public void setAssessment(Assessment assessment) { this.assessment = assessment; }
}