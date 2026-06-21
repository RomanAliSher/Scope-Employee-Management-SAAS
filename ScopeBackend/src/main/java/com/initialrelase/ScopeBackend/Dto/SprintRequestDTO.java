package com.initialrelase.ScopeBackend.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


import java.time.LocalDateTime;

@Data
public class SprintRequestDTO {

    @NotBlank(message="Sprint Name cant be blank")
    private String name;
    private LocalDateTime deadline;
    @NotBlank(message="Sprint Goal cant be blank")
    private String sprintGoal;
    @NotBlank(message = "Status cant be blank")
    private String status;
    @NotBlank(message = "Workspace Name cant be blank")
    private String workspaceName;
}
