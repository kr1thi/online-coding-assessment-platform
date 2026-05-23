package com.famehub.famehub.controller;

import com.famehub.famehub.entity.Institution;
import com.famehub.famehub.repository.InstitutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/hierarchy/institutions")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://online-coding-assessment-platform.vercel.app"
})
public class InstitutionController {

    @Autowired 
    private InstitutionRepository instRepo;

    // get all
    @GetMapping
    public List<Institution> getAll() {
        return instRepo.findAll();
    }

    // add new
    @PostMapping("/add")
    public ResponseEntity<?> createInstitution(@RequestBody Institution institution) {
        try {
            if (instRepo.existsByCode(institution.getCode())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Institution Code already exists!"));
            }
            if (instRepo.existsByPrimaryEmail(institution.getPrimaryEmail())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Primary Email already registered!"));
            }
            
            Institution saved = instRepo.save(institution);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    // delete
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteInstitution(@PathVariable Long id) {
        try {
            if (!instRepo.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("message", "Institution not found!"));
            }
            instRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully!"));
        } catch (Exception e) {
            // Foreign key constraint problem iruntha intha message kaatum
            return ResponseEntity.status(500).body(Map.of("message", "Cannot delete! Ensure branches and teachers are removed first or check database constraints."));
        }
    }

    // Update
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateInstitution(@PathVariable Long id, @RequestBody Institution details) {
        try {
            // Fetch fresh data from DB first
            Institution inst = instRepo.findById(id).orElse(null);
            
            if (inst == null) {
                return ResponseEntity.status(404).body(Map.of("message", "Institution not found in database!"));
            }

            // Update values one by one
            inst.setName(details.getName());
            inst.setCode(details.getCode());
            inst.setHeadName(details.getHeadName());
            inst.setPrimaryEmail(details.getPrimaryEmail());
            inst.setPrimaryContact(details.getPrimaryContact());
            inst.setCity(details.getCity());
            inst.setState(details.getState());
            inst.setInstituteType(details.getInstituteType());
            inst.setAccessPlan(details.getAccessPlan());

            if (details.getPassword() != null && !details.getPassword().trim().isEmpty()) {
                inst.setPassword(details.getPassword());
            }

            instRepo.save(inst);
            return ResponseEntity.ok(Map.of("message", "Updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Update Error: " + e.getMessage()));
        }
    }
}
