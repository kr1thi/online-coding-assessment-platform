package com.famehub.famehub.entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Question {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String type; // MCQ or CODING
    
    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher createdBy;
   
    private String subject;

   
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Teacher getCreatedBy() { return createdBy; }
    public void setCreatedBy(Teacher createdBy) { this.createdBy = createdBy; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
}