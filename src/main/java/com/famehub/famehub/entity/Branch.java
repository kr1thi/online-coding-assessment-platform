package com.famehub.famehub.entity;

import jakarta.persistence.*;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.List;

@Entity
@Table(name = "branch")

@NoArgsConstructor
@AllArgsConstructor
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String branchName; 
    private String branchCode;

   
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "institution_id")
    @JsonIgnoreProperties("branches")
    @JsonBackReference
   
    private Institution institution;
    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("branch")
    private List<Batch> batches;
    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Section> sections;
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getBranchName() {
		return branchName;
	}

	public void setBranchName(String branchName) {
		this.branchName = branchName;
	}

	public String getBranchCode() {
		return branchCode;
	}

	public void setBranchCode(String branchCode) {
		this.branchCode = branchCode;
	}

	public Institution getInstitution() {
		return institution;
	}

	public void setInstitution(Institution institution) {
		this.institution = institution;
	}
    
   
}