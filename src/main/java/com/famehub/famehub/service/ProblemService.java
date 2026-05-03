package com.famehub.famehub.service;

import com.famehub.famehub.entity.Problem;
import com.famehub.famehub.repository.ProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProblemService {

    @Autowired
    private ProblemRepository repository;

    public List<Problem> getAllProblems() {
        return repository.findAll();
    }

    public Problem saveProblem(Problem p) {
        return repository.save(p);
    }

    public Problem getProblemById(Long id) {
        return repository.findById(id).orElse(null);
    }
}