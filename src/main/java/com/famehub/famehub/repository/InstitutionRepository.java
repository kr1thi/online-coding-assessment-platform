package com.famehub.famehub.repository;

import com.famehub.famehub.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, Long> {
    Institution findByCode(String code);
    Institution findByPrimaryEmail(String primaryEmail);
    boolean existsByCode(String code);
    boolean existsByPrimaryEmail(String email);
}