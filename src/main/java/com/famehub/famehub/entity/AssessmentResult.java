package com.famehub.famehub.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_results")
public class AssessmentResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long studentId;
    
  
    private Long assessmentId; 
    
    private Long questionId;
    private Double score;
    private String status;
    private LocalDateTime submittedAt = LocalDateTime.now();

   

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

   
    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}