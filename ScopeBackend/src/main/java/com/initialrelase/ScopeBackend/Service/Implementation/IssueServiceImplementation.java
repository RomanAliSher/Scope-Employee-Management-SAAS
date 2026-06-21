package com.initialrelase.ScopeBackend.Service.Implementation;

import com.initialrelase.ScopeBackend.Dto.IssueRequestDTO;
import com.initialrelase.ScopeBackend.Entity.Issue;
import com.initialrelase.ScopeBackend.Entity.Sprint;
import com.initialrelase.ScopeBackend.Repository.IssueRepository;
import com.initialrelase.ScopeBackend.Repository.SprintRepository;
import com.initialrelase.ScopeBackend.Service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.stereotype.Service;

import java.beans.PropertyDescriptor;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IssueServiceImplementation implements IssueService {

    private final IssueRepository issueRepository;
    private final SprintRepository sprintRepository;

    @Override
    public Issue createIssue(IssueRequestDTO dto) {
        Issue issue = new Issue();

        BeanUtils.copyProperties(dto, issue);

        if (issue.getStatus() == null) {
            issue.setStatus("TODO");
        }

        return issueRepository.save(issue);
    }

    @Override
    public List<Issue> getBacklogIssues(String workspaceName) {
        return issueRepository.findByWorkspaceNameAndSprintIdIsNullOrderByCreatedAtDesc(workspaceName);
    }

    @Override
    public List<Issue> getSprintIssues(String sprintId) {
        return issueRepository.findBySprintId(sprintId);
    }

    @Override
    public Issue updateIssue(String id, IssueRequestDTO dto) {
        Optional<Issue> optionalIssue = issueRepository.findById(id);

        if (optionalIssue.isEmpty()) {
            throw new RuntimeException("Issue not found with ID: " + id);
        }

        Issue issue = optionalIssue.get();

        // Copy only NON-NULL properties from DTO to the existing Issue entity
        BeanUtils.copyProperties(dto, issue, getNullPropertyNames(dto));

        // Custom logic for workflow: clear rejection reason if status is DONE
        if ("DONE".equalsIgnoreCase(issue.getStatus())) {
            issue.setRejectionReason(null);
        }

        Issue updatedIssue = issueRepository.save(issue);

        // AUTO-COMPLETE SPRINT LOGIC
        if (updatedIssue.getSprintId() != null) {
            checkAndCompleteSprint(updatedIssue.getSprintId());
        }

        return updatedIssue;
    }

    @Override
    public void deleteIssue(String id) {
        if (!issueRepository.existsById(id)) {
            throw new RuntimeException("Issue not found with ID: " + id);
        }
        issueRepository.deleteById(id);
    }

    // --- Helper Methods ---

    private void checkAndCompleteSprint(String sprintId) {
        Optional<Sprint> optionalSprint = sprintRepository.findById(sprintId);

        if (optionalSprint.isPresent()) {
            Sprint sprint = optionalSprint.get();

            if ("active".equalsIgnoreCase(sprint.getStatus())) {
                List<Issue> sprintIssues = issueRepository.findBySprintId(sprintId);

                boolean allDone = true;
                for (Issue i : sprintIssues) {
                    if (!"DONE".equalsIgnoreCase(i.getStatus())) {
                        allDone = false;
                        break;
                    }
                }

                if (allDone && !sprintIssues.isEmpty()) {
                    sprint.setStatus("COMPLETED");
                    sprintRepository.save(sprint);
                }
            }
        }
    }

    /**
     * Extracts null property names so BeanUtils doesn't overwrite existing DB values
     * with nulls during partial updates.
     */
    private String[] getNullPropertyNames(Object source) {
        BeanWrapper src = new BeanWrapperImpl(source);
        PropertyDescriptor[] pds = src.getPropertyDescriptors();

        return Arrays.stream(pds)
                .map(PropertyDescriptor::getName)
                .filter(name -> src.getPropertyValue(name) == null)
                .toArray(String[]::new);
    }
}