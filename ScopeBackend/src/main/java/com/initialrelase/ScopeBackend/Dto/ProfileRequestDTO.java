package com.initialrelase.ScopeBackend.Dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileRequestDTO {

     @NotBlank(message = "workspace name cannot be blank")
     private String workspaceName;
     @NotBlank(message = "name cannot be blank")
     private String name;
     @NotBlank(message = "email cannot be blank")
     private String email;
     @NotBlank(message = "password cannot be blank")
     private String password;
     @NotBlank(message = "actual email cant be null")
     private String actualEmail;
}
