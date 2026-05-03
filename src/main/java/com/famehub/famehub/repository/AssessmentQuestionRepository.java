package com.famehub.famehub.repository;

import com.famehub.famehub.entity.AssessmentQuestion;


import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, Long> {

    // Assessmentah delete pannum podhu, adhula ulla questions ai delete panna
    @Modifying
    @Transactional
    @Query("DELETE FROM AssessmentQuestion aq WHERE aq.assessment.id = :assessmentId")
    void deleteByAssessmentId(@Param("assessmentId") Long assessmentId);
long countByAssessmentId(Long assessmentId);
    
    List<AssessmentQuestion> findByAssessmentId(Long assessmentId);

    // Question ID vachu fetch panna (Internal-ah JSON string automatic-ah vandhudum)
    Optional<AssessmentQuestion> findById(Long id);
}