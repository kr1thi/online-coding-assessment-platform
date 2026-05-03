package com.famehub.famehub.dto;

public class GoogleRequest {
    private String email;
    private String name;
    private String googleId;
    private String token; 

    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

   
    public String getEmail() { 
        return email; 
    }
    public void setEmail(String email) { 
        this.email = email; 
    }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
}