package com.famehub.famehub.repository;

import com.famehub.famehub.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
	@Query(value = "SELECT COUNT(DISTINCT problem_id) FROM submission " + 
            "WHERE user_id = :userId AND LOWER(status) IN ('success', 'accepted')", 
    nativeQuery = true)
long countUniqueSolvedProblems(@Param("userId") Long userId);
    //  particular user-oda ella submissions aiyum eduka
    List<Submission> findByUserId(Long userId);
    @Query("SELECT s FROM Submission s JOIN User u ON s.userId = u.id WHERE u.institution.id = :instId")
    List<Submission> findByInstitutionId(@Param("instId") Long instId);

    // Problem base panni submissions eduka
    List<Submission> findByProblemId(Long problemId);
    @Query("SELECT s FROM Submission s WHERE s.userId IN :userIds")
    List<Submission> findByUserIdIn(@Param("userIds") List<Long> userIds);
}