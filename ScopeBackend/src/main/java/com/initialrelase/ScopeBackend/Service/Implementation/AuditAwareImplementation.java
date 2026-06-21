package com.initialrelase.ScopeBackend.Service.Implementation;

import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditAwareImplementation")
public class AuditAwareImplementation implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        return Optional.of("ScopeBackend"); // You can replace this with the actual user or system identifier
    }
}