package com.famehub.famehub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
                .requestMatchers("/api/submissions/student/**")
                .requestMatchers("/api/auth/**");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                    // OPTIONS requests allow
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // Public APIs
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/problems/**").permitAll()
                    .requestMatchers("/api/assessment/**").permitAll()
                    .requestMatchers("/api/users/me").permitAll()

                    // Admin public APIs
                    .requestMatchers("/api/admin/assessment/all").permitAll()
                    .requestMatchers("/api/admin/hierarchy/**").permitAll()
                    .requestMatchers("/api/admin/bulk-upload-students").permitAll()
                    .requestMatchers("/api/admin/bulk-upload-teacher").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/admin/students/all").permitAll()
                    .requestMatchers(HttpMethod.DELETE, "/api/admin/assessment/**").permitAll()
                    .requestMatchers("/api/admin/assessment/public/**").permitAll()

                    // Authenticated APIs
                    .requestMatchers("/api/compiler/**").authenticated()
                    .requestMatchers("/api/submissions/**").authenticated()
                    .requestMatchers("/api/users/update").authenticated()
                    .requestMatchers("/api/assessment/run").authenticated()
                    .requestMatchers("/api/assessment/final-submit").authenticated()

                    // Admin only
                    .requestMatchers("/api/admin/stats").hasAuthority("ADMIN")
                    .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                    // Teacher/Admin
                    .requestMatchers("/api/assessment/*/add-questions")
                    .hasAnyAuthority("ADMIN", "TEACHER")

                    .requestMatchers(HttpMethod.POST, "/api/problems/add")
                    .hasAnyAuthority("ADMIN", "TEACHER")

                    // Any remaining request
                    .anyRequest().authenticated()
            );

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

        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:3000",
                "https://*.vercel.app"
        ));

        configuration.setAllowedMethods(Arrays.asList(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS",
                "PATCH"
        ));

        configuration.setAllowedHeaders(Arrays.asList("*"));

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
