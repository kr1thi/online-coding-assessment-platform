package com.famehub.famehub.service;

import com.famehub.famehub.dto.AssessmentRequest;

import com.famehub.famehub.entity.*;
import com.famehub.famehub.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    @Autowired private AssessmentQuestionRepository assessmentQuestionRepo;
    @Autowired private AssessmentRepository assessmentRepo;
    @Autowired private ProblemRepository problemRepository;

    private final String JUDGE0_BASE_URL = "https://ce.judge0.com/submissions";
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

 
    public Map<String, Object> processSubmission(AssessmentRequest request) {
        AssessmentQuestion question = assessmentQuestionRepo.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if ("MCQ".equalsIgnoreCase(question.getType())) {
            // String comparison ai safe ah handle pannanum
            String studentAns = (request.getSourceCode() != null) ? request.getSourceCode().trim() : "";
            String correctAns = (question.getCorrectAnswer() != null) ? question.getCorrectAnswer().trim() : "";
            boolean isCorrect = studentAns.equalsIgnoreCase(correctAns);
            return Map.of("score", isCorrect ? 100.0 : 0.0, "status", isCorrect ? "ACCEPTED" : "WRONG ANSWER");
        }
        // Coding questions ku mattum evaluateCodingQuestion ai call panran
        return evaluateCodingQuestion(request, question);
    }

    private Map<String, Object> evaluateCodingQuestion(AssessmentRequest request, AssessmentQuestion question) {
        List<Map<String, Object>> testCasesList = parseTestCases(question);
        List<Map<String, Object>> submissions = new ArrayList<>();
        
        for (Map<String, Object> tc : testCasesList) {
            Map<String, Object> sub = new HashMap<>();
            sub.put("source_code", request.getSourceCode());
            sub.put("language_id", request.getLanguageId());
            sub.put("stdin", tc.get("input") != null ? tc.get("input").toString() : "");
            submissions.add(sub);
        }

        try {
            //  Send batch request
            String batchUrl = JUDGE0_BASE_URL + "/batch?base64_encoded=false";
            Map<String, Object> body = Map.of("submissions", submissions);
            ResponseEntity<String> response = restTemplate.postForEntity(batchUrl, body, String.class);
            
            List<Map<String, String>> tokens = objectMapper.readValue(response.getBody(), new TypeReference<List<Map<String, String>>>() {});
            String tokensStr = tokens.stream().map(t -> t.get("token")).collect(Collectors.joining(","));

            // Poll for results
            Thread.sleep(2000); 
            String resultUrl = JUDGE0_BASE_URL + "/batch?tokens=" + tokensStr + "&base64_encoded=false&fields=stdout,status";
            ResponseEntity<String> resultResponse = restTemplate.getForEntity(resultUrl, String.class);
            
            Map<String, Object> resultBody = objectMapper.readValue(resultResponse.getBody(), Map.class);
            List<Map<String, Object>> outputs = (List<Map<String, Object>>) resultBody.get("submissions");

            int passedCount = 0;
            List<Map<String, Object>> results = new ArrayList<>();

            for (int i = 0; i < testCasesList.size(); i++) {
                Map<String, Object> tc = testCasesList.get(i);
                Map<String, Object> output = outputs.get(i);
                
                String stdout = output.get("stdout") != null ? output.get("stdout").toString().trim() : "";
                String expected = tc.get("output") != null ? tc.get("output").toString().trim() : "";
                Map<String, Object> statusObj = (Map<String, Object>) output.get("status");
                int statusId = (statusObj != null) ? ((Number) statusObj.get("id")).intValue() : 0;
                
                boolean passed = (statusId == 3) && stdout.equalsIgnoreCase(expected);
                if (passed) passedCount++;

                results.add(Map.of("passed", passed, "input", tc.get("input")));
            }

            return Map.of("score", (passedCount * 100.0) / testCasesList.size(), 
                          "status", (passedCount == testCasesList.size()) ? "ACCEPTED" : "FAILED", 
                          "testCases", results);

        } catch (Exception e) {
            return Map.of("score", 0, "status", "SERVER_ERROR", "message", e.getMessage());
        }
    }

    private List<Map<String, Object>> parseTestCases(AssessmentQuestion question) {
        try {
            String jsonStr = question.getTestCases();
            // Null check and empty string check
            if (jsonStr == null || jsonStr.trim().isEmpty()) {
                return new ArrayList<>(); // MCQ ku empty list return panran
            }
            if (jsonStr.trim().startsWith("[")) {
                return objectMapper.readValue(jsonStr, new TypeReference<List<Map<String, Object>>>() {});
            }
            return List.of(Map.of("input", jsonStr, "output", question.getExampleOutput() == null ? "" : question.getExampleOutput()));
        } catch (Exception e) { 
            return new ArrayList<>(); 
        }
    }

    public String callJudge0(String code, int langId, String input) {
        String url = JUDGE0_BASE_URL + "?wait=true&base64_encoded=false";
        Map<String, Object> body = Map.of("source_code", code, "language_id", langId, "stdin", input);
        try {
            ResponseEntity<String> res = restTemplate.postForEntity(url, body, String.class);
            Map<String, Object> resBody = objectMapper.readValue(res.getBody(), Map.class);
            return (resBody != null && resBody.get("stdout") != null) ? resBody.get("stdout").toString() : "No Output";
        } catch (Exception e) { return "Connection Error"; }
    }
    
    @Transactional
    public void addQuestionsToAssessment(Long assessmentId, List<Long> questionIds, Map<Long, List<String>> manualOptionsMap) {
        Assessment assessment = assessmentRepo.findById(assessmentId)
            .orElseThrow(() -> new RuntimeException("Assessment not found!"));

        for (Long qId : questionIds) {
            Problem problem = problemRepository.findById(qId)
                .orElseThrow(() -> new RuntimeException("Question ID " + qId + " not found!"));

            problem.setAssessmentId(assessmentId);
            problem.setIsAssessment(true);
            problemRepository.save(problem);

            AssessmentQuestion q = new AssessmentQuestion();
            q.setTitle(problem.getChallengeName());
            q.setDescription(problem.getProblemStatement());
            q.setAssessment(assessment);

            if ("MCQ".equalsIgnoreCase(problem.getTopic())) {
                q.setType("MCQ");
                
                // Manual options handling
                List<String> optionsList = manualOptionsMap != null ? manualOptionsMap.getOrDefault(qId, List.of()) : List.of();
                try {
                    q.setOptions(objectMapper.writeValueAsString(optionsList));
                } catch (Exception e) {
                    q.setOptions("[]");
                }
                q.setTestCases("[]");
            } else {
                q.setType("CODING");
                String jsonTestCases = String.format("[{\"input\": \"%s\", \"output\": \"%s\"}]",
                    problem.getSampleInput().replace("\"", "\\\""),
                    problem.getSampleOutput().replace("\"", "\\\""));
                
                q.setTestCases(jsonTestCases);
                q.setExampleInput(problem.getSampleInput());
                q.setExampleOutput(problem.getSampleOutput());
            }
            assessmentQuestionRepo.save(q);
        }
    }
}