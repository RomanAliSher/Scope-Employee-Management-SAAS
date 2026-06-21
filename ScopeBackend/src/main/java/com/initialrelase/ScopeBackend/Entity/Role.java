package com.initialrelase.ScopeBackend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "roles")
@AttributeOverrides({
        @AttributeOverride(name = "createdBy", column = @Column(name = "created_by", nullable = false, length = 20)),
        @AttributeOverride(name = "updatedBy", column = @Column(name = "updated_by", length = 20))
})
public class Role extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id", nullable = false)
    private Long id;

    @Size(max = 50)
    @NotNull
    @Column(name = "name", nullable = false, length = 50)
    private String name;

}