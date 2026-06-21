package com.initialrelase.ScopeBackend.Service.Implementation;

import com.initialrelase.ScopeBackend.Entity.TeamMember;
import com.initialrelase.ScopeBackend.Entity.User;
import com.initialrelase.ScopeBackend.Entity.Role;
import com.initialrelase.ScopeBackend.Repository.TeamMemberRepository;
import com.initialrelase.ScopeBackend.Repository.UserRepository;
import com.initialrelase.ScopeBackend.Service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamMemberRepository teamRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional // Ensures both tables save successfully, or neither do
    public TeamMember addTeamMember(TeamMember member) {

        // 1. Encode the password provided from the frontend
        String encodedPassword = passwordEncoder.encode(member.getPassword());
        member.setPassword(encodedPassword);

        // 2. Save to the Team table
        TeamMember savedMember = teamRepository.save(member);

        // 3. Create the Login Account in the User table
        if (!userRepository.existsByEmail(member.getEmail())) {
            User loginUser = new User();
            loginUser.setEmail(member.getEmail());
            loginUser.setName(member.getName());
            loginUser.setWorkspaceName(member.getWorkspaceName());

            // Set the exact same encoded password so they can log in
            loginUser.setPassword(encodedPassword);

            // Assign the Employee Role
            Role employeeRole = new Role();
            employeeRole.setName("EMPLOYEE");
            loginUser.setRoles(Set.of(employeeRole));

            userRepository.save(loginUser);
        }

        return savedMember;
    }

    @Override
    public List<TeamMember> getTeamMembers(String workspaceName) {
        return teamRepository.findByWorkspaceName(workspaceName);
    }

    @Override
    public void deleteTeamMember(String id) {
        TeamMember member = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team member not found with ID: " + id));

        // Delete from the Team table
        teamRepository.deleteById(id);

        // Revoke login access by deleting them from the User table
        userRepository.findByEmail(member.getEmail())
                .ifPresent(user -> userRepository.delete(user));
    }
}