package com.bachhoanhanh.gatewayservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.web.server.authentication.ServerBearerTokenAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.HttpStatusServerEntryPoint;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .csrf(csrf -> csrf.disable())

                // ── 1. Custom bearer converter ──────────────────────────────────
                // Returns empty Mono (anonymous) when no token is present,
                // instead of throwing — lets permitAll() paths through cleanly.
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> { /* uses auto-configured JwtDecoder from properties */ })
                        .bearerTokenConverter(exchange -> {
                            ServerBearerTokenAuthenticationConverter delegate =
                                    new ServerBearerTokenAuthenticationConverter();
                            return delegate.convert(exchange)
                                    .onErrorResume(e -> Mono.empty()); // missing token → anonymous
                        })
                        // ── 2. Clean 401 on auth failure (no WWW-Authenticate header noise) ──
                        .authenticationEntryPoint(
                                new HttpStatusServerEntryPoint(HttpStatus.UNAUTHORIZED)
                        )
                )

                // ── 3. Authorization rules ───────────────────────────────────────
                .authorizeExchange(exchange -> exchange

                        // --- Swagger / API docs (always public) ---
                        .pathMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/aggregate/**",
                                "/webjars/**"
                        ).permitAll()

                        // --- Users ---
                        .pathMatchers(HttpMethod.POST, "/users/register").permitAll()
                        .pathMatchers(HttpMethod.POST, "/users/staff").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADMIN")
                        .pathMatchers("/users/**").authenticated()

                        // --- Products ---
                        .pathMatchers(HttpMethod.GET, "/products/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/attribute-types/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/prototypes/**").permitAll()
                        .pathMatchers("/products/**", "/attribute-types/**", "/prototypes/**").authenticated()

                        // --- Brands ---
                        .pathMatchers(HttpMethod.GET, "/brands/**").permitAll()
                        .pathMatchers("/brands/**").authenticated()

                        // --- Catalogs ---
                        .pathMatchers(HttpMethod.GET, "/catalogs/**").permitAll()
                        .pathMatchers("/catalogs/**").authenticated()

                        // --- Orders & Payments (always need token) ---
                        .pathMatchers("/orders/**").authenticated()
                        .pathMatchers("/payments/**").authenticated()

                        // --- Vouchers ---
                        .pathMatchers(HttpMethod.GET,  "/vouchers/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/vouchers/apply").permitAll()
                        .pathMatchers(HttpMethod.POST, "/vouchers").permitAll()
                        .pathMatchers(HttpMethod.PUT,  "/vouchers/**").permitAll()
                        .pathMatchers(HttpMethod.DELETE, "/vouchers/**").permitAll()
                        .pathMatchers("/vouchers/**").authenticated()

                        .anyExchange().permitAll()
                );

        return http.build();
    }
}