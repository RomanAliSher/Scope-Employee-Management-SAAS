package com.initialrelase.ScopeBackend.Repository;

import com.initialrelase.ScopeBackend.Entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, String> {
  // 1. Fetch only items in the Backlog (sprintId is empty/null)
  List<Issue> findByWorkspaceNameAndSprintIdIsNullOrderByCreatedAtDesc(String workspaceName);

  // 2. Fetch items inside a specific Sprint
  List<Issue> findBySprintId(String sprintId);
  @Modifying
  @Query("UPDATE Issue t SET t.workspaceName = :newName WHERE t.workspaceName = :oldName")
  void updateWorkspaceName(@Param("oldName") String oldName, @Param("newName") String newName);
  // 3. Fetch issues assigned to a specific user
  List<Issue> findByWorkspaceNameAndAssigneeEmail(String workspaceName, String assigneeEmail);
}