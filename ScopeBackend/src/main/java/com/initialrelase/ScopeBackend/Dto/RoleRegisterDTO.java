package com.initialrelase.ScopeBackend.Dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Value;

@Value

public class RoleRegisterDTO {
    @NotBlank(message = "roleName cant be blank")
    String roleName;
}
