package com.initialrelase.ScopeBackend.Controller;

import com.initialrelase.ScopeBackend.Entity.TeamMember;
import com.initialrelase.ScopeBackend.Service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/team")
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<TeamMember> addTeamMember(@RequestBody TeamMember member) {
        TeamMember savedMember = teamService.addTeamMember(member);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMember);
    }

    @GetMapping
    public ResponseEntity<List<TeamMember>> getTeamMembers(@RequestParam String workspaceName) {
        List<TeamMember> members = teamService.getTeamMembers(workspaceName);
        return ResponseEntity.ok(members);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeamMember(@PathVariable String id) {
        try {
            teamService.deleteTeamMember(id);
            return ResponseEntity.ok("Team member removed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}