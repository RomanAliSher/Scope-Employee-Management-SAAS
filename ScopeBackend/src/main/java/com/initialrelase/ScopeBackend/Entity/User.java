package com.initialrelase.ScopeBackend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Data
@Table(name="users")
public class User extends BaseEntity {

       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       @Column(name="id", nullable=false)
       private Long id;

       @Size(max = 100)
       @NotNull
       @Column(name="workspace_name", nullable=false, length=100)
       private String workspaceName;

       @Size(max = 100)
       @NotNull
       @Column(name="name", nullable=false, length=100)
       private String name;

       @Size(max = 100)
       @NotNull
       @Column(name="email", nullable=false, length=100)
       private String email;

       @Size(max = 100)
       @NotNull
       @Column(name="password", nullable=false, length=100)
       private String password;

       @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
       @JoinColumn(name = "id", nullable = false)
       private Set<Role> roles = new LinkedHashSet<>();


}