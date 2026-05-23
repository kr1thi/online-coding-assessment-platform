package com.famehub.famehub.controller;

import com.famehub.famehub.entity.User;

import org.springframework.web.multipart.MultipartFile;
import com.famehub.famehub.entity.Teacher;
import com.famehub.famehub.repository.UserRepository;
import com.famehub.famehub.service.TeacherService;
import com.famehub.famehub.repository.TeacherRepository;
import com.famehub.famehub.repository.InstitutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/teachers")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://online-coding-assessment-platform.vercel.app"
})
public class TeacherController {

    @Autowired private UserRepository userRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private InstitutionRepository institutionRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired 
    private TeacherService teacherService;

    @PostMapping("/add")
    public ResponseEntity<?> addTeacher(@RequestBody Map<String, String> request) {
        try {
            //  User create panrom
            User user = new User();
            user.setName(request.get("name"));
            user.setEmail(request.get("email"));
            
			user.setPassword(passwordEncoder.encode("teacher123"));
            user.setRole("TEACHER");

            if (request.get("institutionId") != null) {
                Long instId = Long.parseLong(request.get("institutionId"));
                institutionRepository.findById(instId).ifPresent(user::setInstitution);
            }

            //   save nadakkanum
            User savedUser = userRepository.save(user); 
            System.out.println("User Saved with ID: " + savedUser.getId()); // Intha log varudha nu 

            // 2. TEACHER PROFILE create panrom
            Teacher teacherProfile = new Teacher();
            teacherProfile.setUser(savedUser); // Link panrom
            teacherProfile.setDepartment(request.getOrDefault("department", "General"));

            teacherRepository.save(teacherProfile); 
            System.out.println("Teacher Profile Saved!");

            return ResponseEntity.ok("Teacher account and Profile created!");
        } catch (Exception e) {
            e.printStackTrace(); // Error vandha logs la print aagum
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllTeachers() {
        // Dashboard-la display panna
    	/*List<Teacher> teachers = teacherRepository.findAll(); 
        
       
        List<Map<String, Object>> result = teachers.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", t.getUser().getName());
            map.put("email", t.getUser().getEmail());
            map.put("department", t.getDepartment());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);*/
        return ResponseEntity.ok(userRepository.findByRole("TEACHER")); 
        
    }
    @PostMapping("/bulk-upload_teacher")
    public ResponseEntity<?> bulkUpload(@RequestParam("file") MultipartFile file) {
        try {
            int count = teacherService.saveTeachersFromExcel(file);
            return ResponseEntity.ok(Map.of("message", count + " Teachers imported successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Excel Error: " + e.getMessage()));
        }
    }
    

    // Teacher Dashboard-ku login aana appuram data fetch panna
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getTeacherProfile(@PathVariable Long userId) {
        return teacherRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
