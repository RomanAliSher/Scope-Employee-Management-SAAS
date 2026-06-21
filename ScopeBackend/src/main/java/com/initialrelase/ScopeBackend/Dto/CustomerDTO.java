package com.initialrelase.ScopeBackend.Dto;



import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

@Getter
@Setter
@ToString
public class CustomerDTO implements Serializable {

     @NotBlank(message = "Workspace name is required")
     private String workspaceName;
     @NotBlank(message = "Name is required")
     private String name;
     @NotBlank(message = "Email is required")
     @Email(message = "Email should be valid")
     private String email;
     @NotBlank(message = "Roles are required")
     private String roles;

}
