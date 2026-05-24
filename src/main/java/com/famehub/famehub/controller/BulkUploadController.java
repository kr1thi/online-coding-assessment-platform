package com.famehub.famehub.controller;

import com.famehub.famehub.entity.Student;

import com.famehub.famehub.repository.StudentRepository;

import org.apache.poi.ss.usermodel.*;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;



import java.util.ArrayList;

import java.util.List;

@RestController

@RequestMapping("/api/admin")


public class BulkUploadController {

    @Autowired

    private StudentRepository studentRepo;

    // Numeric numbers -Roll No ("7.18E+10") nu varaama irukka indha helper method

    private String getCellValueAsString(Cell cell) {

        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();

            case NUMERIC:          //decimal format
                DataFormatter formatter = new DataFormatter();
                return formatter.formatCellValue(cell).trim();
            case BOOLEAN:
        return String.valueOf(cell.getBooleanCellValue());

            default:
                return "";

        }

    }

    @PostMapping("/bulk-upload-students")

    public ResponseEntity<?> handleBulkUpload(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) return ResponseEntity.badRequest().body("Excel file is empty!");

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            List<Student> studentsList = new ArrayList<>();

            int skippedCount = 0;

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
         // Row mothama empty-ah iruntha skip pannidum

                if (row == null || isRowEmpty(row)) continue;
                try {
                   // mapping based on excel

                    String rollNo = getCellValueAsString(row.getCell(1)); 
                    String name   = getCellValueAsString(row.getCell(2));
                    String email  = getCellValueAsString(row.getCell(6)); 

                    // basic validation

                    if (rollNo.isEmpty() || name.isEmpty() || email.isEmpty()) {

                        System.out.println("Row " + i + " skipped due to missing data.");

                        skippedCount++;

                        continue;

                    }
                    // Database constraint check

                    if (studentRepo.existsByEmail(email) || studentRepo.existsByRollNo(rollNo)) {

                        skippedCount++;

                        continue; 

                    }

                    Student student = new Student();

                    student.setName(name);
                    student.setRollNo(rollNo);
                    student.setEmail(email);
                    student.setPassword(rollNo); // Default password as roll number
                    student.setRole("STUDENT");
                    studentsList.add(student);
                } catch (Exception rowEx) {

                    System.err.println("Error processing row " + i + ": " + rowEx.getMessage());

                    // Oru row error aanalum matha rowsa process panna continue use pandrom

                    continue;

                }

            }

            if (studentsList.isEmpty()) {
                return ResponseEntity.ok("No new students found to import. (Skipped/Existing: " + skippedCount + ")");

            }
            studentRepo.saveAll(studentsList);

            return ResponseEntity.ok("Import Success! Saved: " + studentsList.size() + ", Skipped: " + skippedCount);

        } catch (Exception e) {

            e.printStackTrace(); // Ithu terminal-la detailed error-a katta

            return ResponseEntity.status(500).body("Critical Error: " + e.getMessage());

        }

    }
    // Helper to check if the entire row is empty

    private boolean isRowEmpty(Row row) {

        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {

            Cell cell = row.getCell(c);

            if (cell != null && cell.getCellType() != CellType.BLANK) return false;

        }
        return true;

    }

}
