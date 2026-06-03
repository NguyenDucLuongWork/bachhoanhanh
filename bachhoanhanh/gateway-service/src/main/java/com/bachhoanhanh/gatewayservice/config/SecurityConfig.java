package com.bachhoanhanh.gatewayservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.oauth2.server.resource.web.server.authentication.ServerBearerTokenAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.HttpStatusServerEntryPoint;
import reactor.core.publisher.Mono;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwkSetUri;

    @Value("${jwt.accepted-issuer}")
    private String acceptedIssuer;

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder
                .withJwkSetUri(jwkSetUri)
                .build();

        OAuth2TokenValidator<Jwt> withIssuers = new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(),
                token -> {
                    String iss = token.getIssuer() != null ? token.getIssuer().toString() : "";
                    // Accept either the internal or external issuer URL
                    if (iss.contains("/realms/bachhoanhanh")) {
                        return OAuth2TokenValidatorResult.success();
                    }
                    return OAuth2TokenValidatorResult.failure(
                            new OAuth2Error("invalid_token", "The iss claim is not valid", null)
                    );
                }
        );

        decoder.setJwtValidator(withIssuers);
        return decoder;
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .csrf(csrf -> csrf.disable())
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt
                                .jwtDecoder(jwtDecoder())          // ← quan trọng
                                .jwtAuthenticationConverter(grantedAuthoritiesExtractor())
                        )
                        .bearerTokenConverter(exchange -> {
                            ServerBearerTokenAuthenticationConverter delegate =
                                    new ServerBearerTokenAuthenticationConverter();
                            return delegate.convert(exchange)
                                    .onErrorResume(e -> Mono.empty());
                        })
                        .authenticationEntryPoint(
                                new HttpStatusServerEntryPoint(HttpStatus.UNAUTHORIZED)
                        )
                )
                .authorizeExchange(exchange -> exchange
                        // --- Swagger / API docs ---
                        .pathMatchers(
                                "/swagger-ui.html", "/swagger-ui/**",
                                "/v3/api-docs/**",   // ← ADDED: covers rewritten paths
                                "/aggregate/**",
                                "/webjars/**"
                        ).permitAll()

                        // --- Users ---
                        .pathMatchers(HttpMethod.POST, "/users/register").permitAll()
                        .pathMatchers(HttpMethod.POST, "/users/staff").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADMIN")
                        .pathMatchers("/users/**").authenticated()

                        // --- Others ---
                        .pathMatchers(HttpMethod.GET, "/products/**", "/attribute-types/**", "/prototypes/**", "/brands/**", "/catalogs/**", "/stocks/**").permitAll()
                        .pathMatchers("/products/**", "/attribute-types/**", "/prototypes/**", "/brands/**", "/catalogs/**", "/stocks/**").authenticated()

                        // --- Orders & Payments ---
                        .pathMatchers("/orders/**", "/payments/**").authenticated()

                        // --- Cart ---
                        .pathMatchers("/cart/**").authenticated()

                        // --- Vouchers ---
                        .pathMatchers(HttpMethod.GET,  "/vouchers/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/vouchers").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/vouchers/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/vouchers/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PATCH, "/vouchers/**").hasRole("ADMIN")

                        // Thêm vào khối authorizeExchange, sau phần vouchers:
                        .pathMatchers(HttpMethod.POST, "/api/ocr/**").authenticated()

                        .anyExchange().permitAll()


                );

        return http.build();
    }

    private Converter<Jwt, Mono<AbstractAuthenticationToken>> grantedAuthoritiesExtractor() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            System.out.println(">>> JWT subject: " + jwt.getSubject());
            System.out.println(">>> realm_access: " + jwt.getClaim("realm_access"));            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess == null || realmAccess.isEmpty()) {
                return Collections.emptyList();
            }
            @SuppressWarnings("unchecked")
            Collection<String> roles = (Collection<String>) realmAccess.get("roles");
            return roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toList());
        });

        // ✅ Wrap bằng ReactiveJwtAuthenticationConverterAdapter
        return new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter);
    }
}
