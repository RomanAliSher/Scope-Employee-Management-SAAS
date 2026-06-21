package com.initialrelase.ScopeBackend.Repository;

import com.initialrelase.ScopeBackend.Entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SprintRepository extends JpaRepository<Sprint, String> {
    // Fetch all sprints for a workspace
    List<Sprint> findByWorkspaceNameOrderByCreatedAtDesc(String workspaceName);
    @Modifying
    @Query("UPDATE Sprint t SET t.workspaceName = :newName WHERE t.workspaceName = :oldName")
    void updateWorkspaceName(@Param("oldName") String oldName, @Param("newName") String newName);
    // Find a specific sprint by status (e.g., to find the currently "ACTIVE" sprint)
    Optional<Sprint> findByWorkspaceNameAndStatus(String workspaceName, String status);

}