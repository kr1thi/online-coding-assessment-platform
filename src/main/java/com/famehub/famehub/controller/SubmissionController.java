package com.famehub.famehub.controller;

import java.security.Principal;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.famehub.famehub.entity.Submission;
import com.famehub.famehub.service.SubmissionService;
import com.famehub.famehub.service.CodeExecutionService;
import com.famehub.famehub.repository.ProblemRepository;
import com.famehub.famehub.repository.SubmissionRepository;


@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "http://localhost:3000")
public class SubmissionController {

    @Autowired private SubmissionService submissionService;
    @Autowired private CodeExecutionService executionService;
    @Autowired private ProblemRepository problemRepo;
    @Autowired private SubmissionRepository submissionRepository;
    
 //  Oru particular student-oda report-ai edukka GET request use panrom
    @GetMapping("/student-report/{userId}")
    public ResponseEntity<List<Submission>> getStudentReport(@PathVariable Long userId) {
        
        //  Databasela poi andha userId-ku moolama ella submissions aiyum filter panni edukirom
        List<Submission> reports = submissionRepository.findByUserId(userId);
        
        // Reports list kaaliya irundha no content nu sollurom
        if (reports.isEmpty()) {
  //deta illna msg vara (api work or not)
            return ResponseEntity.status(404).body(null); 
        }
        
        // 4. Data irundha, adhai JSON format-la frontend-ku anupiduroam
        return ResponseEntity.ok(reports);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> createSubmission(@RequestBody Submission submission) {
        //  Databasela irundhu andha problemai fetch panrom
        var problemOpt = problemRepo.findById(submission.getProblemId());
        
        if (problemOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Problem not found!");
        }

        // problem anme set pandrm-admin pakka
        submission.setProblemName(problemOpt.get().getTitle());

        //  Code Execution Service ai call panrom (Judge0 or Batch)
        CodeExecutionService.ExecutionResult result = executionService.submitCode(
            submission.getCode(), 
            problemOpt.get(), 
            submission.getLanguage()
        );
        
        //  status matrum Passed count update
        submission.setStatus(result.isSuccess() ? "Accepted" : "Wrong Answer");
        submission.setPassedCount(result.getPassedCount());

        // dynamic score calculation evolo test cases passed -percentage
     
        if (result.getTotalCount() > 0) {
            int percentage = (int) (((double) result.getPassedCount() / result.getTotalCount()) * 100);
            submission.setScore(percentage); 
        } else {
            submission.setScore(0);
        }

        // submission ai database la save panrom-id ,score, name
       
        submissionService.saveSubmission(submission);
        
        // Student ku immediate response anuppuvom
        Map<String, Object> response = new HashMap<>();
        response.put("success", result.isSuccess());
        response.put("passedCount", result.getPassedCount());
        response.put("totalCount", result.getTotalCount());
        response.put("score", submission.getScore());
        response.put("problemName", submission.getProblemName());
        response.put("message", result.getMessage());
        
        return ResponseEntity.ok(response);
    }

    // http://localhost:8082/api/submissions/run
    @PostMapping("/run")
    public Map<String, Object> runOnly(@RequestBody Map<String, Object> payload, @RequestParam int langId) {
        String code = (String) payload.get("code");
        String stdin = (String) payload.get("stdin");
        return executionService.runCodeWithInput(code, stdin, langId);
    }
    // http://localhost:8082/api/submissions/all
    @GetMapping("/all")
    public List<Submission> getSubmissions() { 
        List<Submission> list = submissionService.getAllSubmissions();
        return list != null ? list : new ArrayList<>();
    }
}
