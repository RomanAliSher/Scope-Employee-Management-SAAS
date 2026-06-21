package com.initialrelase.ScopeBackend.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtTokenFilterEachRequest extends OncePerRequestFilter {

    private final List<String> publicPaths;
    private final Environment env;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String headerName = env.getProperty("JWT_HEADER");
        if (headerName == null || headerName.isEmpty()) {
            headerName = "Authorization";
        }

        String authHeader = request.getHeader(headerName);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = authHeader.substring(7);
            String secret = env.getProperty("KEY");

            if (secret == null || secret.isEmpty()) {
                filterChain.doFilter(request, response);
                return;
            }

            SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(jwt)
                    .getPayload();

            String username = String.valueOf(claims.get("email"));
            String roles = String.valueOf(claims.get("roles"));

            // FORMAT ROLES: Append "ROLE_" if it doesn't exist
            String formattedRoles = java.util.Arrays.stream(roles.split(","))
                    .map(role -> role.trim().startsWith("ROLE_") ? role.trim() : "ROLE_" + role.trim())
                    .collect(java.util.stream.Collectors.joining(","));

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        AuthorityUtils.commaSeparatedStringToAuthorityList(formattedRoles)
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        } catch (Exception e) {
            throw new BadCredentialsException("Invalid Token received!");
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return publicPaths.stream().anyMatch(publicPath -> pathMatcher.match(publicPath, path));
    }
}