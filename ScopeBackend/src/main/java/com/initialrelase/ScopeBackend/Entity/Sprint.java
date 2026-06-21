package com.initialrelase.ScopeBackend.Entity;

import jakarta.persistence.*;
import lombok.Data;


import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@Entity
@Table(name = "sprints")
public class Sprint extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    // Single date field for the frontend deadline
    private LocalDateTime deadline;

    private String sprintGoal;

    @Column(nullable = false)
    private String status = "PLANNED"; // Default status

    @Column(nullable = false)
    private String workspaceName;


}