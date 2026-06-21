package com.initialrelase.ScopeBackend.Service;

import com.initialrelase.ScopeBackend.Entity.Department;
import java.util.List;
import java.util.Map;

public interface DepartmentService {
    Department createDepartment(Department department);
    List<Department> getDepartments(String workspaceName);
    void deleteDepartment(String id);
    Department addRoleToDepartment(String id, Map<String, String> roleData);
    Department removeRoleFromDepartment(String id, String roleName);
}