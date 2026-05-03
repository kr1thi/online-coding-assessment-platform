package com.famehub.famehub.repository;

import com.famehub.famehub.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByBranchId(Long branchId);
}