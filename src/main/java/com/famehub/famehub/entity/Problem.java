package com.famehub.famehub.entity;

import com.opencsv.bean.CsvBindByName;
import jakarta.persistence.*;

@Entity
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long assessmentId; 

    @CsvBindByName(column = "Topic")
    private String topic;

    @CsvBindByName(column = "Challenge Name")
    private String challengeName; // <--- Idhu dhaan title

    @CsvBindByName(column = "Problem Statement")
    @Column(columnDefinition = "TEXT") 
    private String problemStatement;

    @CsvBindByName(column = "Constraints")
    @Column(columnDefinition = "TEXT")
    private String constraints;

    @CsvBindByName(column = "Input Format")
    @Column(columnDefinition = "TEXT")
    private String inputFormat;

    @CsvBindByName(column = "Output Format")
    @Column(columnDefinition = "TEXT")
    private String outputFormat;

    @CsvBindByName(column = "Sample Input 1")
    @Column(columnDefinition = "TEXT")
    private String sampleInput;

    @CsvBindByName(column = "Sample Output 1")
    @Column(columnDefinition = "TEXT")
    private String sampleOutput;

    @CsvBindByName(column = "Difficulty Level")
    private String difficultyLevel;

    @Column(name = "is_assessment")
    private Boolean isAssessment = false; 

    // Test cases (Input 1-6 & Output 1-6)
    @CsvBindByName(column = "Input 1") @Column(columnDefinition = "TEXT") private String input1;
    @CsvBindByName(column = "Output 1") @Column(columnDefinition = "TEXT") private String output1;
    @CsvBindByName(column = "Input 2") @Column(columnDefinition = "TEXT") private String input2;
    @CsvBindByName(column = "Output 2") @Column(columnDefinition = "TEXT") private String output2;
    @CsvBindByName(column = "Input 3") @Column(columnDefinition = "TEXT") private String input3;
    @CsvBindByName(column = "Output 3") @Column(columnDefinition = "TEXT") private String output3;
    @CsvBindByName(column = "Input 4") @Column(columnDefinition = "TEXT") private String input4;
    @CsvBindByName(column = "Output 4") @Column(columnDefinition = "TEXT") private String output4;
    @CsvBindByName(column = "Input 5") @Column(columnDefinition = "TEXT") private String input5;
    @CsvBindByName(column = "Output 5") @Column(columnDefinition = "TEXT") private String output5;
    @CsvBindByName(column = "Input 6") @Column(columnDefinition = "TEXT") private String input6;
    @CsvBindByName(column = "Output 6") @Column(columnDefinition = "TEXT") private String output6;

    @CsvBindByName(column = "Solution")
    @Column(columnDefinition = "TEXT")
    private String solution;

    // --- ✨ DYNAMIC TITLE HELPER ---
    // Controller-la .getTitle() nu koopta challengeName-ah thiruppi kodukkum
    public String getTitle() {
        return challengeName;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getChallengeName() { return challengeName; }
    public void setChallengeName(String challengeName) { this.challengeName = challengeName; }
    public String getProblemStatement() { return problemStatement; }
    public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }
    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }
    public String getInputFormat() { return inputFormat; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }
    public String getOutputFormat() { return outputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }
    public String getSampleInput() { return sampleInput; }
    public void setSampleInput(String sampleInput) { this.sampleInput = sampleInput; }
    public String getSampleOutput() { return sampleOutput; }
    public void setSampleOutput(String sampleOutput) { this.sampleOutput = sampleOutput; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public Boolean getIsAssessment() { return isAssessment; }
    public void setIsAssessment(Boolean assessment) { isAssessment = (assessment != null) ? assessment : false; }

    public String getInput1() { return input1; }
    public void setInput1(String input1) { this.input1 = input1; }
    public String getOutput1() { return output1; }
    public void setOutput1(String output1) { this.output1 = output1; }
    public String getInput2() { return input2; }
    public void setInput2(String input2) { this.input2 = input2; }
    public String getOutput2() { return output2; }
    public void setOutput2(String output2) { this.output2 = output2; }
    public String getInput3() { return input3; }
    public void setInput3(String input3) { this.input3 = input3; }
    public String getOutput3() { return output3; }
    public void setOutput3(String output3) { this.output3 = output3; }
    public String getInput4() { return input4; }
    public void setInput4(String input4) { this.input4 = input4; }
    public String getOutput4() { return output4; }
    public void setOutput4(String output4) { this.output4 = output4; }
    public String getInput5() { return input5; }
    public void setInput5(String input5) { this.input5 = input5; }
    public String getOutput5() { return output5; }
    public void setOutput5(String output5) { this.output5 = output5; }
    public String getInput6() { return input6; }
    public void setInput6(String input6) { this.input6 = input6; }
    public String getOutput6() { return output6; }
    public void setOutput6(String output6) { this.output6 = output6; }
    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }

	
}