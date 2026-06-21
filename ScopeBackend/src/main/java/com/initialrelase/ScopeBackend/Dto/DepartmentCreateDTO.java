package com.initialrelase.ScopeBackend.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Value;

import java.io.Serializable;
import java.util.Set;

/**
 * DTO for {@link com.initialrelase.ScopeBackend.Entity.Department}
 */
@Value

public class DepartmentCreateDTO implements Serializable {
    @NotBlank(message = "Department name cannot be blank")
    String name;
    @NotBlank(message = "Workspace name cannot be blank")
    String workspaceName;

}