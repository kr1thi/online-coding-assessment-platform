package com.famehub.famehub.controller;

import com.famehub.famehub.dto.AuthResponse;

import com.famehub.famehub.dto.GoogleRequest;
import com.famehub.famehub.entity.Student;
import com.famehub.famehub.entity.User;
import com.famehub.famehub.repository.StudentRepository;
import com.famehub.famehub.repository.UserRepository;
import com.famehub.famehub.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; 
import org.springframework.web.bind.annotation.*;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import jakarta.transaction.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://online-coding-assessment-platform.vercel.app"
})
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private StudentRepository studentRepo;
    // UserDetailsService - roles oda UserDetails object kedaikka
    @Autowired private UserDetailsService userDetailsService;
    
 //  Controller-la add pannanum-
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleRequest request) {
        try {
            // Google Token-a verify panna
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList("794534483950-hbttuopi6119nq2uuavv6argfff91sm2.apps.googleusercontent.com"))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getToken()); // request.getToken() -> Frontend-la anupura token

            if (idToken == null) return ResponseEntity.status(401).body("Invalid Token");

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setName(name);
                    newUser.setEmail(email);
                    // Default ah student,  DBla manualah change pannina adhu work aagum
                    newUser.setRole("STUDENT"); 
                    newUser.setPassword("");
                    return userRepository.save(newUser);
                });

            // JWT Token creation (Role-oda)
            UserDetails userDetails = org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password("")
                    .authorities(user.getRole()) // Role (STUDENT/TEACHER/ADMIN) 
                    .build();

            String jwtToken = jwtUtil.generateToken(userDetails);
            
            // Response
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtToken);
            response.put("role", user.getRole()); // Frontend-ku role anuprom
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        Optional<User> userOpt = userRepository.findByEmail(loginUser.getEmail());
        System.out.println("Login Attempt Email: " + loginUser.getEmail());
        System.out.println("Input Password: " + loginUser.getPassword());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(loginUser.getPassword())) {
                
                //  Verum email kudukkama, roles irukura UserDetailsah load panni kudukanum
                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                String token = jwtUtil.generateToken(userDetails);
                Long sId = studentRepo.findByUser(user).map(Student::getId).orElse(null);

                // Response Map
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("userId", user.getId());
                response.put("name", user.getName());
                response.put("email", user.getEmail());
                response.put("role", user.getRole()); 

                return ResponseEntity.ok(response); 
            } else {
                return ResponseEntity.status(401).body("Invalid Password!"); 
            }
        }
        return ResponseEntity.status(404).body("User not found!");
    }
    @PostMapping("/admin/update-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newRole = payload.get("role"); // "TEACHER" or "ADMIN" or "STUDENT"

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(newRole.toUpperCase());
            userRepository.save(user);
            return ResponseEntity.ok("Role updated to " + newRole);
        }
        return ResponseEntity.status(404).body("User not found!");
    }

 // AuthController-la
    @PostMapping("/register")
    @Transactional // Ensures both or neither are saved
    public ResponseEntity<?> register(@RequestBody User newUser) {
        // save the user
        User savedUser = userRepository.save(newUser);
        
        //  Create the linked student record
        Student newStudent = new Student();
        newStudent.setName(savedUser.getName());
        newStudent.setEmail(savedUser.getEmail());
        newStudent.setUser(savedUser); // Explicitly link the ID
        studentRepo.save(newStudent);
        
        return ResponseEntity.ok(savedUser);
    }
}
