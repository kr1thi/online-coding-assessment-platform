package com.famehub.famehub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }
    @Bean
    public org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
            .requestMatchers("/api/submissions/student/**")
            .requestMatchers("/api/auth/**");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        
        .authorizeHttpRequests(auth -> auth
            //  Pre-flight (OPTIONS) requests-a allow panrom
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
            .requestMatchers("/**").permitAll()
            
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/assessment/**").permitAll().requestMatchers("/api/users/me").permitAll() 
            .requestMatchers("/api/users/me").permitAll() 
            .requestMatchers("/api/problems/**").permitAll()
           
            .requestMatchers("/api/assessment/run", "/api/assessment/final-submit").authenticated()
            .requestMatchers("/api/assessment/*/add-questions").permitAll()
            .requestMatchers("/api/assessment/**").permitAll()
            .requestMatchers("/api/assessment/finish").permitAll()
            .requestMatchers("/api/admin/assessment/all").permitAll()
            .requestMatchers("/api/admin/hierarchy/**").permitAll()
            .requestMatchers("/api/admin/bulk-upload-students").permitAll()
            .requestMatchers("/api/admin/bulk-upload-teacher").permitAll()
            .requestMatchers("/api/admin/bulk-upload").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/admin/students/all").permitAll()
            .requestMatchers(HttpMethod.DELETE, "/api/admin/assessment/**").permitAll()
            .requestMatchers("/api/admin/assessment/public/**").permitAll()
            .requestMatchers("/api/admin/stats").hasAuthority("ADMIN")
           
            
            .requestMatchers("/api/assessment/*/add-questions").hasAnyAuthority("ADMIN", "TEACHER")
            .requestMatchers("/api/admin/bulk-upload").hasAnyAuthority("ADMIN", "TEACHER")
      
            
            .requestMatchers("/api/admin/assessment/**").hasAnyAuthority("ADMIN", "TEACHER", "ROLE_ADMIN", "ROLE_TEACHER")
            .requestMatchers(HttpMethod.POST, "/api/problems/add").hasAnyAuthority("ADMIN", "TEACHER", "ROLE_ADMIN", "ROLE_TEACHER")
            .requestMatchers("/api/admin/bulk-upload").hasAnyAuthority("ADMIN", "TEACHER", "ROLE_ADMIN", "ROLE_TEACHER")
            .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
          
            .requestMatchers("/api/compiler/**", "/api/submissions/**", "/api/users/update").authenticated()
            .requestMatchers("/api/assessment/run", "/api/assessment/final-submit").authenticated()
            
           
            .requestMatchers("/api/admin/**").hasAuthority("ADMIN") 
            .requestMatchers(HttpMethod.POST, "/api/problems/add").authenticated() 
            .requestMatchers("/api/admin/bulk-upload").authenticated()
            .requestMatchers("/api/compiler/**").authenticated()
            .requestMatchers("/api/submissions/**").authenticated()
            .requestMatchers("/api/users/update").authenticated() 
            
            .anyRequest().authenticated() 
        );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
     "http://localhost:3000",
    "https://*.vercel.app"
    ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
