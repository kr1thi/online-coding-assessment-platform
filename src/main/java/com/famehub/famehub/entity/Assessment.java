package com.famehub.famehub.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assessments")
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Integer duration; 

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<AssessmentQuestion> questions = new ArrayList<>();

    public Assessment() {}

    public void addQuestion(AssessmentQuestion question) {
        questions.add(question);
        question.setAssessment(this);
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public List<AssessmentQuestion> getQuestions() { return questions; }
    public void setQuestions(List<AssessmentQuestion> questions) { this.questions = questions; }
}