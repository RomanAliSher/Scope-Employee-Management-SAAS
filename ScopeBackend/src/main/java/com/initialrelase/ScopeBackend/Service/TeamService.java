package com.initialrelase.ScopeBackend.Service;

import com.initialrelase.ScopeBackend.Entity.TeamMember;
import java.util.List;

public interface TeamService {
    TeamMember addTeamMember(TeamMember member);
    List<TeamMember> getTeamMembers(String workspaceName);
    void deleteTeamMember(String id);
}