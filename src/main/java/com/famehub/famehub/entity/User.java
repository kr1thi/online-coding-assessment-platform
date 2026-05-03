package com.famehub.famehub.entity;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
//  UserDetails interface ai implements pannanum
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password;
    
    // default ha studentrole
    private String role = "STUDENT"; 

    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;
//403 error
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        //role=securityconfig
    	String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return List.of(new SimpleGrantedAuthority(roleWithPrefix));
    }

    @Override
    public String getUsername() {
        return email; 
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
    private Long addedBy; 

    public Long getAddedBy() { return addedBy; }
    public void setAddedBy(Long addedBy) { this.addedBy = addedBy; }
   
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
}