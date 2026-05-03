package com.famehub.famehub.entity;

import com.fasterxml.jackson.annotation.JsonProperty;


import jakarta.persistence.*;

@Entity

public class Student {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name")
    private String name;

    @Column(name = "roll_no")
    @JsonProperty("rollNo")
    private String rollNo; 
    
    @Column(unique = true)
    private String email;
    
    private String phoneNumber;
    
    private String password;
    
    private String role = "STUDENT"; 

    @ManyToOne 
    @JoinColumn(name = "section_id")
    private Section section;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;
    private Long addedBy;

    public Long getAddedBy() { return addedBy; }
    public void setAddedBy(Long addedBy) { this.addedBy = addedBy; }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    @JsonProperty("rollNo")
    public String getRollNo() { return rollNo; }
    
    
    @JsonProperty("rollNo")
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Section getSection() { return section; }
    public void setSection(Section section) { this.section = section; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public void setBatch(Batch batch) {
        this.batch = batch;
    }
    
    public Batch getBatch() {
        return batch;
    }
}