package com.famehub.famehub.repository;

import com.famehub.famehub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface UserRepository extends JpaRepository<User, Long> {
    // Login panna 
    Optional<User> findByEmail(String email);

    // Dashboard la separate ah list panna 
    List<User> findByRole(String role);
    boolean existsByEmail(String email);
}