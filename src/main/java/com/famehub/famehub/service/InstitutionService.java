package com.famehub.famehub.service;

import com.famehub.famehub.entity.Batch;
import com.famehub.famehub.entity.Branch;
import com.famehub.famehub.entity.Institution;
import com.famehub.famehub.repository.BatchRepository;
import com.famehub.famehub.repository.BranchRepository;
import com.famehub.famehub.repository.InstitutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InstitutionService {

    @Autowired 
    private InstitutionRepository instRepo;

    @Autowired 
    private BranchRepository branchRepo;
    @Autowired 
    private BatchRepository batchRepo;
//institution logic
    public List<Institution> getAllInstitutions() {
        return instRepo.findAll();
    }

    public Institution getInstitutionById(Long id) {
        return instRepo.findById(id).orElse(null);
    }

    @Transactional
    public Institution saveInstitution(Institution inst) {
        return instRepo.save(inst);
    }

    @Transactional
    public void deleteInstitution(Long id) {
        instRepo.deleteById(id);
    }
//branch logic
    public List<Branch> getAllBranches() {
        return branchRepo.findAll();
    }

    // Institution IDai vachu mattum branches ai filter panna
    public List<Branch> getBranchesByInstitution(Long instId) {
        return branchRepo.findByInstitutionId(instId);
    }

    @Transactional
    public Branch saveBranch(Branch branch) {
        return branchRepo.save(branch);
    }

    public void deleteBranch(Long id) {
        branchRepo.deleteById(id);
       
    }
    //batch logic
    public List<Batch> getAllBatches() {
        return batchRepo.findAll();
    }

    public Batch saveBatch(Batch batch) {
        return batchRepo.save(batch);
    }

    public List<Batch> getBatchesByBranch(Long branchId) {
        return batchRepo.findByBranchId(branchId);
    }
    
}