package com.famehub.famehub.service;

import com.famehub.famehub.entity.Student;
import com.famehub.famehub.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentService {

    @Autowired private StudentRepository studentRepo;

    public List<Student> getStudentsBySection(Long sectionId) {
        return studentRepo.findBySectionId(sectionId);
    }

    public Student saveStudent(Student student) {
        // Inga venumna neenga student-oda roll no format-ai check pannalaam (Validation)
        return studentRepo.save(student);
    }
}