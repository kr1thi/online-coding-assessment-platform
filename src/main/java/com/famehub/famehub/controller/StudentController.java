package com.famehub.famehub.controller;

import com.famehub.famehub.entity.Student;
import com.famehub.famehub.entity.User;
import com.famehub.famehub.repository.StudentRepository;
import com.famehub.famehub.repository.UserRepository;
import com.famehub.famehub.repository.BatchRepository;
import com.famehub.famehub.repository.SectionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private BatchRepository batchRepo;
    @Autowired private UserRepository userRepo;

    // get all students
    @GetMapping("/all")
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    // Delete Student
    @Transactional
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            
            return studentRepo.findById(id).map(student -> {
                if (student.getUser() != null) {
                    userRepo.delete(student.getUser());
                }
                studentRepo.delete(student);

                return ResponseEntity.ok(Map.of("message", "Student and linked User account permanently removed."));
            }).orElseGet(() -> 
                ResponseEntity.status(404).body(Map.of("message", "Student not found!"))
            );

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Server Error: " + e.getMessage()));
        }
    }
   /* @Transactional
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            if (!studentRepo.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("message", "Student not found!"));
            }
            studentRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Student permanently removed."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "DB Error: " + e.getMessage()));
        }
    }*/

    //  Manual Add Student
    @PostMapping("/add")
    @Transactional
    public ResponseEntity<?> addStudent(@RequestBody Map<String, Object> payload) {
        try {
            String rollNo = payload.get("rollNo") != null ? payload.get("rollNo").toString().trim() : "";
            String email = payload.get("email") != null ? payload.get("email").toString().trim() : "";
            String name = payload.get("name").toString();
            Long addedById = payload.get("addedBy") != null ? Long.valueOf(payload.get("addedBy").toString()) : null;

           

            // Check if student already exists
            if (studentRepo.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Email already exists!"));
            }
            if (studentRepo.existsByRollNo(rollNo)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Roll No already exists!"));
            }
            if (userRepo.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Email already exists!"));
            }
            
            User userAccount = new User();
            userAccount.setName(name);
            userAccount.setEmail(email);
            userAccount.setPassword(rollNo); // Default password as Roll No
            userAccount.setRole("STUDENT");
            userAccount.setAddedBy(addedById);
            
            User savedUser = userRepo.save(userAccount);

            Student student = new Student();
            student.setName(payload.get("name") != null ? payload.get("name").toString() : "");
            student.setRollNo(rollNo);
            student.setEmail(email);
            student.setPassword(rollNo); // default password as roll number
            student.setRole("STUDENT");
            student.setUser(savedUser);
            student.setAddedBy(addedById);
            

            // Fetch batch and set it
            if (payload.get("batchId") != null && !payload.get("batchId").toString().isEmpty()) {
                try {
                    Long batchId = Long.valueOf(payload.get("batchId").toString());
                    batchRepo.findById(batchId).ifPresent(student::setBatch);
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid Batch ID format"));
                }
            }

            Student savedStudent = studentRepo.save(student);
            return ResponseEntity.ok(savedStudent);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Server Error: " + e.getMessage()));
        }
    }
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Student>> getStudentsByTeacher(@PathVariable Long teacherId) {
        List<Student> students = studentRepo.findByAddedBy(teacherId);
        return ResponseEntity.ok(students);
    }
}