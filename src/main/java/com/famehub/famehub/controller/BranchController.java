package com.famehub.famehub.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.famehub.famehub.entity.Branch;
import com.famehub.famehub.entity.Institution;
import com.famehub.famehub.service.InstitutionService;

@RestController
@RequestMapping("/api/admin/branches")

public class BranchController {

    @Autowired
    private InstitutionService institutionService;

    @GetMapping
    public List<Branch> getAll() {
        return institutionService.getAllBranches();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addBranch(@RequestBody Map<String, Object> payload) {
        try {
            //Reactla irundhu branchName nu anupa porom, so ingaiyum adhe key
            String branchName = (String) payload.get("branchName"); 
            String branchCode = (String) payload.get("branchCode");
            
            if (payload.get("institutionId") == null) {
                return ResponseEntity.badRequest().body("Institution ID is missing!");
            }
            
            Long instId = Long.valueOf(payload.get("institutionId").toString());

            Institution inst = institutionService.getInstitutionById(instId);
            if (inst == null) return ResponseEntity.badRequest().body("Institution not found!");

            Branch branch = new Branch();
            branch.setBranchName(branchName); 
            branch.setBranchCode(branchCode);
            branch.setInstitution(inst);

            return ResponseEntity.ok(institutionService.saveBranch(branch));
        } catch (Exception e) {
            // Error message ai print panni pakka
            e.printStackTrace(); 
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
