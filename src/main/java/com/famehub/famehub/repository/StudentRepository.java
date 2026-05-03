package com.famehub.famehub.repository;

import com.famehub.famehub.entity.Student;
import com.famehub.famehub.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
	 
   
Optional<Student> findByUser(User user);

Optional<Student> findFirstByUserId(Long userId);
    
Optional<Student> findByUserId(Long userId); // Matta methods...
  
    List<Student> findBySectionId(Long sectionId);
    Optional<Student> findByEmail(String email);
    boolean existsByEmail(String email);
    void deleteById(Long id);
	boolean existsByRollNo(String rollNo);

	List<Student> findByAddedBy(Long teacherId);
}