package com.initialrelase.ScopeBackend.Entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "team_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"email", "workspaceName"})
})
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @Column(nullable = false)
    private String email;

    private String role="EMPLOYEE";
    private String designation;
    private String departmentName;
    private String password;
    @Column(nullable = false)
    private String workspaceName;
}