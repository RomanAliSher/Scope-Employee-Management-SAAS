package com.initialrelase.ScopeBackend.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "issues")
public class Issue extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String status = "TODO"; // Default status

    private String priority = "MEDIUM"; // Default priority

    private String type = "TASK"; // Default type (TASK, BUG, EPIC)

    private String assigneeEmail;

    @Column(nullable = false)
    private String workspaceName;

    // THIS IS done to add issues in sprint
    // If null = It is in the Backlog.
    // If filled = It is inside an active/planned Sprint.
    @Column(nullable = true)
    private String sprintId;

    // NEW FIELDS FOR WORKFLOW
    @Column(length = 1000)
    private String rejectionReason;

    private String lastActionAt;
}