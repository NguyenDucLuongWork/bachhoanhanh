package com.bachhoanhanh.userservice.service;

import com.bachhoanhanh.userservice.model.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakAdminService {

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin-client-id}")
    private String clientId;

    @Value("${keycloak.admin-client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    // Lấy admin access token
    private String getAdminToken() {
        String url = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                url, new HttpEntity<>(body, headers), Map.class
        );
        return (String) response.getBody().get("access_token");
    }

    // Tạo user trên Keycloak, trả về keycloakId
    public String createUser(String username, String email, String password, Role role) {
        String token = getAdminToken();
        String url = serverUrl + "/admin/realms/" + realm + "/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> userRep = new HashMap<>();
        userRep.put("username", username);
        userRep.put("email", email);
        userRep.put("enabled", true);
        userRep.put("emailVerified", true);
        userRep.put("credentials", List.of(
                Map.of("type", "password", "value", password, "temporary", false)
        ));

        ResponseEntity<Void> response = restTemplate.postForEntity(
                url, new HttpEntity<>(userRep, headers), Void.class
        );

        // Lấy keycloakId từ header Location: .../users/{id}
        String location = response.getHeaders().getFirst("Location");
        String keycloakId = location.substring(location.lastIndexOf("/") + 1);

        // Gán role
        assignRole(keycloakId, role, token);

        return keycloakId;
    }

    // Xóa user trên Keycloak
    public void deleteUser(String keycloakId) {
        String token = getAdminToken();
        String url = serverUrl + "/admin/realms/" + realm + "/users/" + keycloakId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
    }

    private void assignRole(String keycloakId, Role role, String token) {
        // 1. Lấy role representation
        String roleUrl = serverUrl + "/admin/realms/" + realm + "/roles/" + role.name();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        ResponseEntity<Map> roleResp = restTemplate.exchange(
                roleUrl, HttpMethod.GET, new HttpEntity<>(headers), Map.class
        );

        // 2. Gán role cho user
        String assignUrl = serverUrl + "/admin/realms/" + realm
                + "/users/" + keycloakId + "/role-mappings/realm";
        headers.setContentType(MediaType.APPLICATION_JSON);

        restTemplate.postForEntity(
                assignUrl,
                new HttpEntity<>(List.of(roleResp.getBody()), headers),
                Void.class
        );
    }
}