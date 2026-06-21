package com.initialrelase.ScopeBackend.Dto;

import com.initialrelase.ScopeBackend.Entity.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
public class ProfileResponseDTO {

    @NotBlank(message = "workspace name cannot be blank")
    private String workspaceName;

    @NotBlank(message = "name cannot be blank")
    private String name;

    @NotBlank(message = "email cannot be blank")
    private String email;

    // Add roles so the frontend doesn't lose the user's permissions
    @NotBlank(message = "roles cannot be blank")
    private Set<Role> roles = new LinkedHashSet<>();
}