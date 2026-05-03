package com.famehub.famehub.service;

import com.famehub.famehub.entity.Problem;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class CodeExecutionService {

    @Autowired private RestTemplate restTemplate;

    public static class ExecutionResult {
        @JsonProperty("success") private boolean success;
        @JsonProperty("message") private String message;
        @JsonProperty("passedCount") private int passedCount;
        @JsonProperty("totalCount") private int totalCount;

        public ExecutionResult(boolean success, String message, int passedCount, int totalCount) {
            this.success = success;
            this.message = message;
            this.passedCount = passedCount;
            this.totalCount = totalCount;
        }

        // Getters and Setters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public int getPassedCount() { return passedCount; }
        public int getTotalCount() { return totalCount; }
    }

    private final String JUDGE0_URL = "https://ce.judge0.com/submissions?wait=true&base64_encoded=true";

    public ExecutionResult submitCode(String code, Problem problem, String language) {
        int langId = getLanguageId(language);
        List<String> inputs = Arrays.asList(problem.getInput1(), problem.getInput2(), problem.getInput3(), problem.getInput4(), problem.getInput5(), problem.getInput6());
        List<String> outputs = Arrays.asList(problem.getOutput1(), problem.getOutput2(), problem.getOutput3(), problem.getOutput4(), problem.getOutput5(), problem.getOutput6());

        List<Map<String, Object>> batchSubmissions = new ArrayList<>();
        List<String> validOutputs = new ArrayList<>();

        //  Batch request ah ready pandran
        for (int i = 0; i < inputs.size(); i++) {
            if (inputs.get(i) != null && !inputs.get(i).trim().isEmpty()) {
                Map<String, Object> sub = new HashMap<>();
                sub.put("source_code", Base64.getEncoder().encodeToString(code.getBytes()));
                sub.put("language_id", langId);
                sub.put("stdin", Base64.getEncoder().encodeToString(inputs.get(i).getBytes()));
                batchSubmissions.add(sub);
                validOutputs.add(outputs.get(i));
            }
        }

        try {
            //  Ore Requestla Judge0 ku anupuroam (Parallel execution starts)
        	
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("submissions", batchSubmissions);
            
            // Judge0 batch URL: https://ce.judge0.com/submissions/batch?base64_encoded=true
            ResponseEntity<List> response = restTemplate.postForEntity("https://ce.judge0.com/submissions/batch?base64_encoded=true", requestBody, List.class);
            List<Map<String, String>> tokens = response.getBody();

            //  Oru 2 seconds wait panni resultsai collect panna
            Thread.sleep(2000); 
            
            StringBuilder tokenQuery = new StringBuilder();
            for(Map<String, String> t : tokens) tokenQuery.append(t.get("token")).append(",");
            
            String resultUrl = "https://ce.judge0.com/submissions/batch?tokens=" + tokenQuery + "&base64_encoded=true";
            Map<String, List<Map<String, Object>>> batchResults = restTemplate.getForObject(resultUrl, Map.class);
            List<Map<String, Object>> resultsList = batchResults.get("submissions");

            //  Results ai check panra logic
            int passedCount = 0;
            String firstError = null;

            for (int i = 0; i < resultsList.size(); i++) {
                Map<String, Object> res = resultsList.get(i);
                String stdout = decode(res.get("stdout"));
                String stderr = decode(res.get("stderr"));
                String compileOut = decode(res.get("compile_output"));

                if (compileOut != null && !compileOut.isEmpty()) return new ExecutionResult(false, "Compile Error!", 0, resultsList.size());
                
                String actual = (stdout != null ? stdout.trim() : "").replaceAll("\\s+$", "").replace("\r\n", "\n");
                String expected = (validOutputs.get(i) != null ? validOutputs.get(i).trim() : "").replaceAll("\\s+$", "").replace("\r\n", "\n");

                if (actual.equals(expected)) {
                    passedCount++;
                } else if (firstError == null) {
                    firstError = "Wrong Answer on Case " + (i+1);
                }
            }

            boolean allPassed = (passedCount == resultsList.size());
            return new ExecutionResult(allPassed, allPassed ? "Accepted 🏆" : passedCount + "/" + resultsList.size() + " Passed\n" + firstError, passedCount, resultsList.size());

        } catch (Exception e) {
        	
            return new ExecutionResult(false, "Parallel Execution Error: " + e.getMessage(), 0, 0);
        }
    }

    // ... runCodeWithInput, callJudge0, decode, getLanguageId (same as before)
    public Map<String, Object> runCodeWithInput(String code, String stdin, int langId) {
        Map<String, Object> res = callJudge0(code, stdin, langId);
        res.put("stdout", decode(res.get("stdout")));
        res.put("stderr", decode(res.get("stderr")));
        res.put("compile_output", decode(res.get("compile_output")));
        return res;
    }

    private Map<String, Object> callJudge0(String code, String stdin, int langId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        Map<String, Object> body = new HashMap<>();
        body.put("source_code", Base64.getEncoder().encodeToString(code.getBytes()));
        body.put("language_id", langId);
        body.put("stdin", Base64.getEncoder().encodeToString((stdin != null ? stdin : "").getBytes()));
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        return restTemplate.postForEntity(JUDGE0_URL, entity, Map.class).getBody();
    }

    private String decode(Object obj) {
        if (obj == null) return null;
        try { return new String(Base64.getDecoder().decode(obj.toString().trim())).trim(); }
        catch (Exception e) { return obj.toString(); }
    }

    private int getLanguageId(String lang) {
        return switch (lang.toLowerCase()) {
            case "java" -> 62;
            case "python" -> 71;
            default -> 54;
        };
    }
}