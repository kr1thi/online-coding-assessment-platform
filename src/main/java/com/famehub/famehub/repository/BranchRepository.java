package com.famehub.famehub.repository;

import com.famehub.famehub.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    // Institution ID ai vachu branches ai filter panna
    List<Branch> findByInstitutionId(Long institutionId);
}