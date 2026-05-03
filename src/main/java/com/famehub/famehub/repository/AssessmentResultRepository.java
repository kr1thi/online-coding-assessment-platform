package com.famehub.famehub.repository;

import com.famehub.famehub.entity.AssessmentResult;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, Long> {
    
    // Student ID vachu search panna
    List<AssessmentResult> findByStudentId(Long studentId);
    
    // Assessment ID vachu search panna 
    List<AssessmentResult> findByAssessmentId(Long assessmentId);
}