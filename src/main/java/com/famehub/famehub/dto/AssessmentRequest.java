package com.famehub.famehub.dto;

public class AssessmentRequest {
    private Long studentId;
    private Long assessmentId; 
    private Long questionId;
    private Integer languageId;
    private String sourceCode;

    // getter,setter
    public Long getStudentId() { return studentId; }
    public Long getAssessmentId() { return assessmentId; } 
    public Long getQuestionId() { return questionId; }
    public Integer getLanguageId() { return languageId; }
    public String getSourceCode() { return sourceCode; }
    
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; } 
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public void setLanguageId(Integer languageId) { this.languageId = languageId; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }
}