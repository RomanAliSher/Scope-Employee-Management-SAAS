package com.initialrelase.ScopeBackend.Controller;

import com.initialrelase.ScopeBackend.Entity.Department;
import com.initialrelase.ScopeBackend.Service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/department")
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.createDepartment(department));
    }

    @GetMapping
    public ResponseEntity<?> getDepartments(@RequestParam String workspaceName) {
        List<Department> depts = departmentService.getDepartments(workspaceName);
        if (depts.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(depts);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable String id) {
        try {
            departmentService.deleteDepartment(id);
            return ResponseEntity.ok("Department deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/roles")
    public ResponseEntity<?> addRole(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            return ResponseEntity.ok(departmentService.addRoleToDepartment(id, payload));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/roles/{roleName}")
    public ResponseEntity<?> removeRole(@PathVariable String id, @PathVariable String roleName) {
        try {
            return ResponseEntity.ok(departmentService.removeRoleFromDepartment(id, roleName));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}