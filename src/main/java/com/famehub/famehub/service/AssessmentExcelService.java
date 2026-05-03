package com.famehub.famehub.service;

import com.famehub.famehub.entity.AssessmentQuestion;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.*;

@Service
public class AssessmentExcelService {

	public List<AssessmentQuestion> parseCSV(InputStream is) throws Exception {
	    List<AssessmentQuestion> questions = new ArrayList<>();
	    
	    try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"))) {
	        String line;
	        boolean isHeader = true;
	        
	        while ((line = reader.readLine()) != null) {
	            if (isHeader) { isHeader = false; continue; }
	            
	            // Comma vachu split panrom
	            String[] data = line.split(","); 
	            
	            // data length correct ah irukka nu paakka
	            System.out.println("DEBUG: Column count is " + data.length);
	            
	            if (data.length >= 4) {
	                AssessmentQuestion q = new AssessmentQuestion();
	                
	                String title = data[0].trim();
	                String desc = data[1].trim();
	                String input = data[2].trim();
	                String output = data[3].trim();
	                
	                q.setTitle(title);
	                q.setDescription(desc);
	                q.setExampleInput(input);
	                q.setExampleOutput(output);
	                q.setType("CODING");
	                
	                //  Actual datavai print panni paaka
	                System.out.println("DEBUG: Row Data -> " + title + " | Input: " + input + " | Output: " + output);
	                
	                questions.add(q);
	            } else {
	                System.out.println("DEBUG: Row skipped due to low column count: " + line);
	            }
	        }
	    }
	    return questions;
	}
}