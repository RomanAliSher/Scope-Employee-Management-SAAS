package com.initialrelase.ScopeBackend.Service;

import com.initialrelase.ScopeBackend.Dto.IssueRequestDTO;
import com.initialrelase.ScopeBackend.Entity.Issue;
import java.util.List;

public interface IssueService {
    Issue createIssue(IssueRequestDTO dto);
    List<Issue> getBacklogIssues(String workspaceName);
    List<Issue> getSprintIssues(String sprintId);
    Issue updateIssue(String id, IssueRequestDTO dto);
    void deleteIssue(String id);
}