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
                "/api/v1/department/**",
                "/api/v1/team/**",
                "/api/v1/issues/**",
                "/api/v1/sprints/**"
        );
    }
}