package com.initialrelase.ScopeBackend.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TeamMemberRequestDTO {

    @NotBlank(message = "team member name cant be blank")
    private String name;
    @Email(message = "Invalid email format")
    @NotBlank(message = "email cant be blank")
    private String email;
    @NotBlank(message = "designation cant be blank")
    private String designation;
    @NotBlank(message="departmentName cant be blank")
    private String departmentName;
    @NotBlank(message = "workspaceName cant be blank")
    private String workspaceName;
    @NotBlank(message = "password cant be blank")
    private String password;
}