package com.initialrelase.ScopeBackend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "department", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"name", "workspaceName"})
})
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String workspaceName;
    private String name;


    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "department_roles", // this creates another table related to role_name
            joinColumns = @JoinColumn(name = "department_id")
    )
    @Column(name = "role_name")
    private Set<String> roles = new HashSet<>();


}