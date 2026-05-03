package com.famehub.famehub.repository;

import com.famehub.famehub.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
}