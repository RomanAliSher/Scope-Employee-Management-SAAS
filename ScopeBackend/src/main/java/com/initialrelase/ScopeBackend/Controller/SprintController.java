package com.initialrelase.ScopeBackend.Controller;

import com.initialrelase.ScopeBackend.Dto.SprintRequestDTO;
import com.initialrelase.ScopeBackend.Entity.Sprint;
import com.initialrelase.ScopeBackend.Entity.Issue;
import com.initialrelase.ScopeBackend.Repository.SprintRepository;
import com.initialrelase.ScopeBackend.Repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintRepository sprintRepository;
    private final IssueRepository issueRepository; // Tasks check karne ke liye inject kiya

    // 1. CREATE A SPRINT
    @PostMapping
    public ResponseEntity<?> createSprint(@RequestBody SprintRequestDTO dto) {
        Sprint sprint = new Sprint();
        sprint.setName(dto.getName());
        sprint.setDeadline(dto.getDeadline());
        sprint.setSprintGoal(dto.getSprintGoal());
        sprint.setWorkspaceName(dto.getWorkspaceName());

        if (dto.getStatus() != null) {
            sprint.setStatus(dto.getStatus());
        } else {
            sprint.setStatus("PLANNED");
        }

        Sprint savedSprint = sprintRepository.save(sprint);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSprint);
    }

    // 2. GET ALL SPRINTS (Auto-check Expiry with Tasks validation)
    @GetMapping
    public ResponseEntity<List<Sprint>> getWorkspaceSprints(@RequestParam String workspaceName) {
        List<Sprint> sprints = sprintRepository.findByWorkspaceNameOrderByCreatedAtDesc(workspaceName);
        boolean isModified = false;

        for (Sprint sprint : sprints) {
            // Agar deadline guzar chuki hai aur sprint complete nahi hai
            if (sprint.getDeadline() != null &&
                    sprint.getDeadline().isBefore(LocalDateTime.now()) &&
                    !"COMPLETED".equalsIgnoreCase(sprint.getStatus())) {

                // Check karein kya saare tasks DONE hain?
                List<Issue> sprintTasks = issueRepository.findBySprintId(sprint.getId());
                boolean allDone = true;

                for (Issue task : sprintTasks) {
                    if (!"DONE".equalsIgnoreCase(task.getStatus())) {
                        allDone = false;
                        break;
                    }
                }

                // Agar tasks rehte hain aur status EXPIRED nahi hai, to EXPIRED karo
                if (!allDone && !"EXPIRED".equalsIgnoreCase(sprint.getStatus())) {
                    sprint.setStatus("EXPIRED");
                    sprintRepository.save(sprint);
                    isModified = true;
                }
            }
        }

        if (isModified) {
            sprints = sprintRepository.findByWorkspaceNameOrderByCreatedAtDesc(workspaceName);
        }

        return ResponseEntity.ok(sprints);
    }

    // 3. UPDATE A SPRINT (Blocks updating to ACTIVE if already Expired)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSprint(@PathVariable String id, @RequestBody SprintRequestDTO dto) {
        Optional<Sprint> optionalSprint = sprintRepository.findById(id);

        if (optionalSprint.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sprint not found");
        }

        Sprint sprint = optionalSprint.get();
        if (dto.getName() != null) sprint.setName(dto.getName());
        if (dto.getSprintGoal() != null) sprint.setSprintGoal(dto.getSprintGoal());
        if (dto.getDeadline() != null) sprint.setDeadline(dto.getDeadline());

        // Target status check karo jo frontend bhej rha hai
        String targetStatus = dto.getStatus() != null ? dto.getStatus() : sprint.getStatus();

        // Validation: Agar deadline guzar chuki hai to use ACTIVE hone se roko jab tak saare tasks DONE na hon
        if (sprint.getDeadline() != null &&
                sprint.getDeadline().isBefore(LocalDateTime.now()) &&
                !"COMPLETED".equalsIgnoreCase(targetStatus)) {

            List<Issue> sprintTasks = issueRepository.findBySprintId(sprint.getId());
            boolean allDone = true;

            for (Issue task : sprintTasks) {
                if (!"DONE".equalsIgnoreCase(task.getStatus())) {
                    allDone = false;
                    break;
                }
            }

            if (!allDone) {
                targetStatus = "EXPIRED"; // Force status back to EXPIRED
            }
        }

        sprint.setStatus(targetStatus);
        Sprint updatedSprint = sprintRepository.save(sprint);
        return ResponseEntity.ok(updatedSprint);
    }

    // 4. DELETE A SPRINT
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSprint(@PathVariable String id) {
        if (!sprintRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sprint not found");
        }
        sprintRepository.deleteById(id);
        return ResponseEntity.ok("Sprint deleted successfully");
    }
}