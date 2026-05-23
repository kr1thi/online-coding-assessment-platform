package com.famehub.famehub.controller;

import com.famehub.famehub.entity.Problem;

import com.famehub.famehub.repository.ProblemRepository;
import com.famehub.famehub.service.CodeExecutionService;
import com.famehub.famehub.service.ProblemService;
import com.famehub.famehub.service.SubmissionService;
import com.famehub.famehub.entity.Submission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://online-coding-assessment-platform.vercel.app"
})
public class ProblemController {

    @Autowired private CodeExecutionService executionService;
    @Autowired private ProblemService problemService;
    @Autowired private SubmissionService submissionService;
    @Autowired private ProblemRepository problemRepository;

    // pranctice section
    @GetMapping("/practice")
    public ResponseEntity<List<Problem>> getPracticeProblems() {
        // Idhu Practice pagela mattum dhaan kaattum
        return ResponseEntity.ok(problemRepository.findByIsAssessmentFalse());
    }

    // assessment section filter by assessmentid
    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<List<Problem>> getAssessmentProblems(@PathVariable Long assessmentId) {
        // Idhu Assessment pagela antha specific testku ulla questions mattum edukum
        return ResponseEntity.ok(problemRepository.findByAssessmentId(assessmentId));
    }

    // Get single problem by ID 
    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable Long id) {
        return problemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

  //save problem logic
    @PostMapping("/add")
    public ResponseEntity<?> addProblem(@RequestBody Problem problem) {
        try {
            // Check if assessmentId is present and not zero
            if (problem.getAssessmentId() != null && problem.getAssessmentId() > 0) {
                problem.setIsAssessment(true); //  ithu Assessment section-ku poidum
            } else {
                problem.setIsAssessment(false); // ID illana Practice pool-ku poidum
                problem.setAssessmentId(null);
            }

            Problem savedProblem = problemRepository.save(problem);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Problem Saved Successfully!");
            response.put("type", savedProblem.getIsAssessment() ? "ASSESSMENT" : "PRACTICE");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    // Admin ku ellaathayum kaatta (stats purpose)
    @GetMapping("/all")
    public ResponseEntity<List<Problem>> getAllProblems() {
        return ResponseEntity.ok(problemRepository.findAll());
    }

    // run and submit logic
    @PostMapping("/run")
    public ResponseEntity<?> handleRun(@RequestBody Map<String, Object> request) {
        String userCode = (String) request.get("code");
        String lang = (String) request.get("language");
        String stdin = (String) request.get("stdin");
        int langId = lang.equalsIgnoreCase("java") ? 62 : (lang.equalsIgnoreCase("python") ? 71 : 54);
        return ResponseEntity.ok(executionService.runCodeWithInput(userCode, stdin, langId));
    }

    @PostMapping("/submit/{id}")
    public ResponseEntity<?> handleSubmit(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        String userCode = (String) request.get("code");
        String lang = (String) request.get("language");
        Problem problem = problemService.getProblemById(id);
        CodeExecutionService.ExecutionResult result = executionService.submitCode(userCode, problem, lang);

        Submission s = new Submission();
        s.setCode(userCode);
        s.setLanguage(lang);
        s.setProblemId(id);
        s.setUserId(1L); 
        s.setStatus(result.isSuccess() ? "ACCEPTED" : "WRONG ANSWER");
        s.setPassedCount(result.getPassedCount()); 
        submissionService.saveSubmission(s); 

        return ResponseEntity.ok(result);
    }
}
