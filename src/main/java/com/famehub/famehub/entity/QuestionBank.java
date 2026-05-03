package com.famehub.famehub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "master_question_bank")
public class QuestionBank {

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
    private String template; 

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(name = "example_input", columnDefinition = "TEXT")
    private String exampleInput;

    @Column(name = "example_output", columnDefinition = "TEXT")
    private String exampleOutput;

    private String difficulty; //easy,hard
    private String category;  //java.python

    // Default Constructor
    public QuestionBank() {}

    
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

    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public String getExampleInput() { return exampleInput; }
    public void setExampleInput(String exampleInput) { this.exampleInput = exampleInput; }

    public String getExampleOutput() { return exampleOutput; }
    public void setExampleOutput(String exampleOutput) { this.exampleOutput = exampleOutput; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}