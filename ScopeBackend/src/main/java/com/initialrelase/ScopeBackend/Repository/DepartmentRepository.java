package com.initialrelase.ScopeBackend.Repository;

import com.initialrelase.ScopeBackend.Entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, String> {
    List<Department> findByWorkspaceName(String workspaceName);
    @Modifying
    @Query("UPDATE Department t SET t.workspaceName = :newName WHERE t.workspaceName = :oldName")
    void updateWorkspaceName(@Param("oldName") String oldName, @Param("newName") String newName);
    Optional<Department> findByIdAndWorkspaceName(String id, String workspaceName);
    Optional<Department> findByNameAndWorkspaceName(String name, String workspaceName);
}