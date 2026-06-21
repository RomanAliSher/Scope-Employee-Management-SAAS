package com.initialrelase.ScopeBackend.Repository;

import com.initialrelase.ScopeBackend.Entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, String> {
  List<TeamMember> findByWorkspaceName(String workspaceName);
  Optional<TeamMember> findByEmailAndWorkspaceName(String email, String workspaceName);
  Optional<TeamMember> findByEmail(String email);
  @Modifying
  @Query("UPDATE TeamMember t SET t.workspaceName = :newName WHERE t.workspaceName = :oldName")
  void updateWorkspaceName(@Param("oldName") String oldName, @Param("newName") String newName);
}