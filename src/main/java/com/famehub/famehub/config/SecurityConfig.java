package com.famehub.famehub.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http

            // Disable CSRF
            .csrf(csrf -> csrf.disable())

            // Enable CORS
            .cors(Customizer.withDefaults())

            // Stateless Session
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // API Authorization
            .authorizeHttpRequests(auth -> auth

                // Allow preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public APIs
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/problems/**").permitAll()
                .requestMatchers("/api/assessment/**").permitAll()
                .requestMatchers("/api/users/me").permitAll()

                // Protected APIs
                .requestMatchers("/api/compiler/**").authenticated()
                .requestMatchers("/api/submissions/**").authenticated()
                .requestMatchers("/api/users/update").authenticated()

                // Any remaining request
                .anyRequest().authenticated()
            );

        // JWT Filter
        http.addFilterBefore(
            jwtAuthFilter,
            UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Allow Frontend Origins
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000",
            "https://*.vercel.app"
        ));

        // Allow Methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS",
            "PATCH"
        ));

        // Allow Headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Expose Headers
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization"
        ));

        // Allow Credentials
        configuration.setAllowCredentials(true);

        // Cache preflight response
        configuration.setMaxAge(3600L);

        // Apply CORS
        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
