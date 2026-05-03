package com.famehub.famehub.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity

@NoArgsConstructor
@AllArgsConstructor
public class Batch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String batchName; 
    private Integer startYear;
    private Integer endYear;

 // Batch.java-la
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id")
    @JsonIgnoreProperties({"batches", "institution"})
    private Branch branch;

    //Students chain-aiyum handle panna
    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("batch")
    private List<Student> students;
    

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getBatchName() {
		return batchName;
	}

	public void setBatchName(String batchName) {
		this.batchName = batchName;
	}

	public Integer getStartYear() {
		return startYear;
	}

	public void setStartYear(Integer startYear) {
		this.startYear = startYear;
	}

	public Integer getEndYear() {
		return endYear;
	}

	public void setEndYear(Integer endYear) {
		this.endYear = endYear;
	}

	public Branch getBranch() {
		return branch;
	}

	public void setBranch(Branch branch) {
		this.branch = branch;
	}
    
}