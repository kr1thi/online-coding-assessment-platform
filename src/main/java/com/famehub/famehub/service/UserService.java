package com.famehub.famehub.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.famehub.famehub.entity.User;
import com.famehub.famehub.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    // Save user
    public User saveUser(User user) {
        return repo.save(user);
    }

    // Get all users
    public List<User> getAllUsers() {
        return repo.findAll();
    }
}
