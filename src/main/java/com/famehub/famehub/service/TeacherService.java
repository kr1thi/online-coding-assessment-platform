package com.famehub.famehub.service;

import com.famehub.famehub.entity.Institution;

import com.famehub.famehub.entity.Teacher;
import com.famehub.famehub.entity.User;
import com.famehub.famehub.repository.InstitutionRepository;
import com.famehub.famehub.repository.TeacherRepository;
import com.famehub.famehub.repository.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class TeacherService {

    @Autowired private TeacherRepository teacherRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private InstitutionRepository institutionRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public Teacher getTeacherByUserId(Long userId) {
        return teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Teacher not found for user ID: " + userId));
    }
//bulk upload logic
   
    @Transactional // Any error occurs, everything rolls back
    public int saveTeachersFromExcel(MultipartFile file) throws Exception {
        int savedCount = 0;
        
        // Open workbook
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        //  Iterate through rows (skip header row 0)
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || row.getCell(0) == null) continue;

            //  0-Name, 1-Email, 2-Dept, 3-InstID
            String name = getCellValue(row.getCell(0));
            String email = getCellValue(row.getCell(1));
            String dept = getCellValue(row.getCell(2));
            String instIdStr = getCellValue(row.getCell(3));

            // Email duplicate check 
            if (userRepository.existsByEmail(email)) continue; 

            // Create & save user account
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setRole("TEACHER");
            user.setPassword(passwordEncoder.encode("teacher123")); // default password

            // Link Institution if present
            if (instIdStr != null && !instIdStr.isEmpty()) {
                Long instId = (long) Double.parseDouble(instIdStr);
                institutionRepository.findById(instId).ifPresent(user::setInstitution);
            }

            User savedUser = userRepository.save(user);

            // Create & save Teacher Profile
            Teacher teacherProfile = new Teacher();
            teacherProfile.setUser(savedUser);
            teacherProfile.setDepartment(dept != null ? dept : "General");

            teacherRepository.save(teacherProfile);
            savedCount++;
        }

        workbook.close();
        return savedCount;
    }

    // helper method to handle different cell types (String vs numeric)
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC: return String.valueOf(cell.getNumericCellValue());
            default: return "";
        }
    }
}