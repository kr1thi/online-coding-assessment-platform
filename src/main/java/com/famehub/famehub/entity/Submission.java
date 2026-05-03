package com.famehub.famehub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "submission")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT") 
    private String code;

    private String language;
    private String status; 
    
    @Column(name = "problem_id")
    private Long problemId;
 // Inside Submission.java
 
   

    // ✨ Added Problem Name Field
    @JsonProperty("problemName")
    @Column(name = "problem_name")
    private String problemName;

    @Column(name = "user_id")
    private Long userId;

    @JsonProperty("userName")
    @Column(name = "user_name")
    private String userName;

    @Column(name = "passed_count")
    private Integer passedCount = 0; 

    @Column(name = "score")
    private Integer score = 0;
  

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }
    
    public String getProblemName() { return problemName; }
    public void setProblemName(String problemName) { this.problemName = problemName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Integer getPassedCount() { return passedCount == null ? 0 : passedCount; }
    public void setPassedCount(Integer passedCount) { this.passedCount = passedCount; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}