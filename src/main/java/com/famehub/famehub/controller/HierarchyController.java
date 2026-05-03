package com.famehub.famehub.controller;

import com.famehub.famehub.entity.*;
import com.famehub.famehub.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/hierarchy")
@CrossOrigin(origins = "http://localhost:3000")
public class HierarchyController {

    @Autowired private InstitutionRepository instRepo;
    @Autowired private BranchRepository branchRepo;
    @Autowired private BatchRepository batchRepo; 
    @Autowired private StudentRepository studentRepo;

    // brances
    @GetMapping("/branches/all")
    public List<Branch> getAllBranches() {
        return branchRepo.findAll();
    }

    @PostMapping("/branches/add")
    public ResponseEntity<?> addBranch(@RequestBody Map<String, String> request) {
        try {
            String branchName = request.get("branchName");
            String branchCode = request.get("branchCode");
            String instIdStr = request.get("institutionId");

            if (branchName == null || instIdStr == null) {
                return ResponseEntity.badRequest().body("Error: Missing required fields!");
            }

            Long instId = Long.parseLong(instIdStr);
            return instRepo.findById(instId).map(institution -> {
                Branch branch = new Branch();
                branch.setBranchName(branchName);
                branch.setBranchCode(branchCode);
                branch.setInstitution(institution);
                branchRepo.save(branch);
                return ResponseEntity.ok("Branch added successfully!");
            }).orElseGet(() -> ResponseEntity.badRequest().body("Error: Institution ID " + instId + " not found!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Server Error: " + e.getMessage());
        }
    }

    // student
    @PostMapping("/students/add")
    @Transactional
    public ResponseEntity<?> addStudent(@RequestBody Map<String, String> request) {
        try {
            String rollNo = request.get("rollNo");
            if (studentRepo.existsByRollNo(rollNo)) {
                return ResponseEntity.badRequest().body("Error: Roll Number already exists!");
            }
            Student student = new Student();
            student.setName(request.get("name"));
            student.setRollNo(rollNo);
            student.setEmail(request.get("email"));
            student.setPassword("password123"); 

            Long batchId = Long.parseLong(request.get("batchId"));
            Batch batch = batchRepo.findById(batchId).orElseThrow(() -> new RuntimeException("Batch not found"));
            student.setBatch(batch);

            studentRepo.save(student);
            return ResponseEntity.ok("Student Added Successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
 // HierarchyController.java kulla indha delete methods ah add pannum

 // delete branch
 @DeleteMapping("/branches/delete/{id}")
 @Transactional
 public ResponseEntity<?> deleteBranch(@PathVariable Long id) {
     try {
         if (!branchRepo.existsById(id)) {
             return ResponseEntity.badRequest().body("Error: Branch not found!");
         }
         // Indha branch kulla batches irundha cascade delete aagum 
         branchRepo.deleteById(id);
         return ResponseEntity.ok("Branch deleted successfully!");
     } catch (Exception e) {
         return ResponseEntity.internalServerError().body("Could not delete branch: " + e.getMessage());
     }
 }

 //delete batch
 @DeleteMapping("/hierarchy-batches/delete/{id}")
 @Transactional
 public ResponseEntity<?> deleteBatch(@PathVariable Long id) {
     try {
         if (!batchRepo.existsById(id)) {
             return ResponseEntity.badRequest().body("Error: Batch not found!");
         }
         batchRepo.deleteById(id);
         return ResponseEntity.ok("Batch deleted successfully!");
     } catch (Exception e) {
         return ResponseEntity.internalServerError().body("Could not delete batch: " + e.getMessage());
     }
 }

 // delete student
 @DeleteMapping("/students/delete/{id}")
 @Transactional
 public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
     try {
         if (!studentRepo.existsById(id)) {
             return ResponseEntity.badRequest().body("Error: Student not found!");
         }
         studentRepo.deleteById(id);
         return ResponseEntity.ok("Student deleted successfully!");
     } catch (Exception e) {
         return ResponseEntity.internalServerError().body("Could not delete student: " + e.getMessage());
     }
 }
}