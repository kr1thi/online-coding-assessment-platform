package com.famehub.famehub.controller;

import com.famehub.famehub.entity.Batch;

import com.famehub.famehub.entity.Branch;
import com.famehub.famehub.repository.BatchRepository;
import com.famehub.famehub.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/hierarchy/batches") // Dashboard pathoda match aagum
@CrossOrigin(origins = "http://localhost:3000")
public class BatchController {

    @Autowired
    private BatchRepository batchRepo;

    @Autowired
    private BranchRepository branchRepo;

    // Get all batches for the list
    @GetMapping("/all")
    public List<Batch> getAllBatches() {
        return batchRepo.findAll();
    }

    // Add new batch
    @PostMapping("/add")
    public ResponseEntity<?> addBatch(@RequestBody Map<String, String> request) {
        try {
            String batchName = request.get("batchName");
            String branchIdStr = request.get("branchId");

            if (batchName == null || branchIdStr == null) {
                return ResponseEntity.badRequest().body("Batch Name and Branch ID are required!");
            }

            Long branchId = Long.parseLong(branchIdStr);
            Batch batch = new Batch();
            batch.setBatchName(batchName);

            // Finding and setting branch
            Branch branch = branchRepo.findById(branchId)
                    .orElseThrow(() -> new RuntimeException("Branch not found with ID: " + branchId));
            
            batch.setBranch(branch);
            batchRepo.save(batch);
            
            return ResponseEntity.ok("Batch created successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    //  Delete batch
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteBatch(@PathVariable Long id) {
        try {
            batchRepo.deleteById(id);
            return ResponseEntity.ok("Batch deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Delete failed: Record linked to students");
        }
    }
}