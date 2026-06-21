package com.initialrelase.ScopeBackend.Security;


import com.initialrelase.ScopeBackend.Entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;

import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class JwtService {
    private final Environment environment;

    public String generateToken(Authentication authentication) {
        var userDetails = (User) authentication.getPrincipal();
        String secret = environment.getProperty("KEY");
        SecretKey secretKey = Keys.hmacShaKeyFor(secret != null ? secret.getBytes(StandardCharsets.UTF_8) : null);
        String jwt = Jwts.builder()
                .issuer("ScopeBackend")
                .subject("JwtToken")
                .claim("workSpaceName",userDetails.getWorkspaceName())
                .claim("name", userDetails.getName())
                .claim("email", userDetails.getEmail())
                .claim("roles", authentication.getAuthorities().stream().map(
                        GrantedAuthority::getAuthority).collect(Collectors.joining(",")))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(secretKey)
                .compact();
        return jwt;
    }
}
