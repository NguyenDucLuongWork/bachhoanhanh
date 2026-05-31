package com.bachhoanhanh.gatewayservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.http.HttpMethod;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeExchange(exchange -> exchange
                        // ===== USERS =====
                        .pathMatchers(HttpMethod.POST, "/users/register").permitAll()
                        .pathMatchers(HttpMethod.POST, "/users/staff").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADMIN")
                        .pathMatchers("/users/**").authenticated()

                        // ===== PRODUCTS (Mới & Cũ) =====
                        .pathMatchers(HttpMethod.GET, "/products/**").permitAll()
                        .pathMatchers("/products/**").authenticated()

                        // ===== ATTRIBUTE TYPES (Mới thêm) =====
                        .pathMatchers(HttpMethod.GET, "/attribute-types/**").permitAll()
                        .pathMatchers("/attribute-types/**").authenticated()

                        // ===== PROTOTYPES (Mới thêm) =====
                        .pathMatchers(HttpMethod.GET, "/prototypes/**").permitAll()
                        .pathMatchers("/prototypes/**").authenticated()

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
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public ReactiveJwtAuthenticationConverterAdapter keycloakJwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess == null) {
                return List.of();
            }

            Object rolesClaim = realmAccess.get("roles");
            if (!(rolesClaim instanceof List<?> roles)) {
                return List.of();
            }

            return roles.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toList());
        });
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }
}
