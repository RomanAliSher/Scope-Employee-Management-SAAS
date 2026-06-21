package com.initialrelase.ScopeBackend.Controller;

import com.initialrelase.ScopeBackend.Dto.IssueRequestDTO;
import com.initialrelase.ScopeBackend.Entity.Issue;
import com.initialrelase.ScopeBackend.Service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/issues")
public class IssueController {

    private final IssueService issueService;

    @PostMapping
    public ResponseEntity<Issue> createIssue(@RequestBody IssueRequestDTO dto) {
        Issue savedIssue = issueService.createIssue(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedIssue);
    }

    @GetMapping("/backlog")
    public ResponseEntity<List<Issue>> getBacklogIssues(@RequestParam String workspaceName) {
        List<Issue> backlogIssues = issueService.getBacklogIssues(workspaceName);
        return ResponseEntity.ok(backlogIssues);
    }

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<Issue>> getSprintIssues(@PathVariable String sprintId) {
        List<Issue> sprintIssues = issueService.getSprintIssues(sprintId);
        return ResponseEntity.ok(sprintIssues);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIssue(@PathVariable String id, @RequestBody IssueRequestDTO dto) {
        try {
            Issue updatedIssue = issueService.updateIssue(id, dto);
            return ResponseEntity.ok(updatedIssue);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable String id) {
        try {
            issueService.deleteIssue(id);
            return ResponseEntity.ok("Issue deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}