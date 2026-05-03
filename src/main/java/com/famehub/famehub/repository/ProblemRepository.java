package com.famehub.famehub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.famehub.famehub.entity.Problem;
import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    // Dashboard stats kaaga (Neenga keta count logic)
    long countByIsAssessment(boolean isAssessment);

    //  Practice Page-ku (Assessment illatha problems mattum)
    // isAssessment = false nu irukura problems-ah fetch pannum
    List<Problem> findByIsAssessmentFalse();

    // Assessment Page-ku (Specific test questions)
    // Particular assessment ID-kulla irukura questions-ah mattum fetch pannum
    List<Problem> findByAssessmentId(Long assessmentId);
    
    // Admin Repository view-kaaga
    List<Problem> findByIsAssessmentTrue();
}