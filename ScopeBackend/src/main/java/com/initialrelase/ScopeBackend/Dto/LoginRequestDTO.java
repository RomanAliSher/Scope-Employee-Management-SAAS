package com.initialrelase.ScopeBackend.Dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.initialrelase.ScopeBackend.Entity.User}
 */
public record LoginRequestDTO(String email, String password) {
}