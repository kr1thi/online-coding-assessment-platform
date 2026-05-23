package com.famehub.famehub.controller;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.famehub.famehub.repository.StudentRepository;
import com.famehub.famehub.repository.TeacherRepository;
import com.famehub.famehub.repository.UserRepository;
import com.famehub.famehub.repository.SubmissionRepository; 
import com.famehub.famehub.entity.User;
import com.famehub.famehub.service.UserService;
import com.famehub.famehub.service.JwtUtil; 

@RestController
@RequestMapping("/api/users")
// Frontend (React) kuda connect panna origins correct-aa irukanum
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://online-coding-assessment-platform.vercel.app"
})
public class UserController {

    @Autowired private UserService service;
    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepo;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SubmissionRepository submissionRepo; 
    @Autowired private JwtUtil jwtUtil;

    /*
      1. get current user profile (/api/users/me)
      Token-ai vachu user details matrum stats (solved count) edukkum.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // Token validation
            if (token == null || !token.startsWith("Bearer ") || token.length() < 8) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token Missing or Invalid Format");
            }
            String jwt = token.substring(7);
            String email = jwtUtil.extractUsername(jwt); 
           // User fetch with safety
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found in database: " + email));
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", user.getId());
            profileData.put("name", user.getName() != null ? user.getName() : "FameHub User");
            profileData.put("email", user.getEmail());
            profileData.put("role", user.getRole());      
            //  Institution Safety 
            String instName = "FameHub Institute";
            if (user.getInstitution() != null) {
                try {
                    instName = user.getInstitution().getName();
                } catch (Exception e) {
                    instName = "FameHub Institute";
                }
            }
            profileData.put("institution", instName);

            // 4. Student Logic
            if ("STUDENT".equals(user.getRole())) {
                try {
                   
                    long solvedCount = submissionRepo.countUniqueSolvedProblems(user.getId());
                    profileData.put("solvedCount", solvedCount);
                } catch (Exception e) {
                    profileData.put("solvedCount", 0);
                    System.err.println("Query Error: " + e.getMessage());
                }
                
                profileData.put("streak", "0 Days");
                profileData.put("accuracy", "0%");   

                studentRepo.findByEmail(email).ifPresentOrElse(s -> {
                    profileData.put("rollNo", s.getRollNo() != null ? s.getRollNo() : "N/A");
                    profileData.put("batch", (s.getBatch() != null) ? s.getBatch().getBatchName() : "Not Assigned");
                }, () -> {
                    profileData.put("rollNo", "N/A");
                    profileData.put("batch", "N/A");
                });
            }

            return ResponseEntity.ok(profileData);

        } catch (Exception e) {
            e.printStackTrace(); // Console-ai check panna 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Backend Crash: " + e.getMessage());
        }
    }
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> updates) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractUsername(jwt);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            // Name update logic
            if (updates.containsKey("name") && updates.get("name") != null) {
                user.setName(updates.get("name"));
            }   
            userRepository.save(user);            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile updated successfully!");
            return ResponseEntity.ok(response);           
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating profile: " + e.getMessage());
        }
    }
    //admin only- crate new user
    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = service.saveUser(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }
   //get all user
    @GetMapping
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }
}
