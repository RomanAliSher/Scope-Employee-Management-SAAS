package com.initialrelase.ScopeBackend.Dto;

import jakarta.validation.constraints.NotBlank;

import jakarta.validation.constraints.Size;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link com.initialrelase.ScopeBackend.Entity.User}
 */
@Value
public class UserRegistrationDTO implements Serializable {

    @NotBlank(message = "workspaceName cant be blank")
    @Size(max = 100) String workspaceName;
    @NotBlank(message = "name cant be blank")
    @Size(max = 100) String name;
    @NotBlank(message = "email cant be blank")
    @Size(max = 100) String email;
    @NotBlank(message = "password cant be blank")
    @Size(max = 100) String password;
}