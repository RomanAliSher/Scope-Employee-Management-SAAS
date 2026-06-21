package com.initialrelase.ScopeBackend.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IssueRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Description is required")
    private String description;
    @NotBlank(message = "Priority is required")
    private String priority;
    @NotBlank(message = "Type is required")
    private String type;
    @NotBlank(message = "Status is required")
    private String status;
    @Email(message = "Assignee email is not valid")
    private String assigneeEmail;
    @NotBlank(message = "Workspace cant be blank")
    private String workspaceName;
    private String sprintId;
    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;
    private String lastActionAt;
}