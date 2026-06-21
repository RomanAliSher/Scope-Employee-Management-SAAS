package com.initialrelase.ScopeBackend.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class PublicPathConfig {

    @Bean
    public List<String> publicPaths(){

        return List.of(
                "/api/v1/auth/**",
                "/api/v1/auth/department/**",
                "/api/v1/auth/team/**",
                "/api/v1/auth/issues/**",
                "/api/v1/auth/sprints/**"
        );
    }
}