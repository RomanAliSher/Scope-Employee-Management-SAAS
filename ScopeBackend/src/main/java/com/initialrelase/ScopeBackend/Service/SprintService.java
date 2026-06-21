package com.initialrelase.ScopeBackend.Service;

import com.initialrelase.ScopeBackend.Entity.Sprint;
import java.util.List;

public interface SprintService {
    Sprint createSprint(Sprint sprint);
    List<Sprint> getSprintsByWorkspace(String workspaceName);
    Sprint updateSprint(String id, Sprint sprintDto);
    void deleteSprint(String id);
}