package com.initialrelase.ScopeBackend.Service.Implementation;

import com.initialrelase.ScopeBackend.Entity.Department;
import com.initialrelase.ScopeBackend.Repository.DepartmentRepository;
import com.initialrelase.ScopeBackend.Service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    @Override
    public List<Department> getDepartments(String workspaceName) {
        return departmentRepository.findByWorkspaceName(workspaceName);
    }

    @Override
    public void deleteDepartment(String id) {
        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found with ID: " + id);
        }
        departmentRepository.deleteById(id);
    }

    @Override
    public Department addRoleToDepartment(String id, Map<String, String> roleData) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + id));

        String roleName = roleData.get("roleName");
        if (roleName != null && !department.getRoles().contains(roleName)) {
            department.getRoles().add(roleName);
            return departmentRepository.save(department);
        }
        return department;
    }

    @Override
    public Department removeRoleFromDepartment(String id, String roleName) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + id));

        department.getRoles().remove(roleName);
        return departmentRepository.save(department);
    }
}