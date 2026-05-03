package com.famehub.famehub.repository;

import com.famehub.famehub.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByBranchId(Long branchId);
}