package com.bachhoanhanh.gatewayservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeExchange(exchange -> exchange

                        // ===== PRODUCTS =====
                        .pathMatchers(HttpMethod.GET, "/products/**").permitAll()
                        .pathMatchers("/products/**").authenticated()

                        // ===== BRANDS =====
                        .pathMatchers(HttpMethod.GET, "/brands/**").permitAll()
                        .pathMatchers("/brands/**").authenticated()

                        // ===== CATALOGS =====
                        .pathMatchers(HttpMethod.GET, "/catalogs/**").permitAll()
                        .pathMatchers("/catalogs/**").authenticated()

                        // ===== ORDERS ===== (luôn cần token)
                        .pathMatchers("/orders/**").authenticated()

                        // ===== PAYMENTS =====
                        .pathMatchers("/payments/**").authenticated()

                        // Swagger public
                        .pathMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/aggregate/**",
                                "/webjars/**"
                        ).permitAll()

                        .anyExchange().permitAll()
                )
                .oauth2ResourceServer(oauth -> oauth.jwt());

        return http.build();
    }
}