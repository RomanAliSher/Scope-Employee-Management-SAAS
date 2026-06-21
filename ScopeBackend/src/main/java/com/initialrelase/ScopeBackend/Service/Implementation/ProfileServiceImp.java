package com.initialrelase.ScopeBackend.Service.Implementation;

import com.initialrelase.ScopeBackend.Dto.PassChangeDTO;
import com.initialrelase.ScopeBackend.Dto.ProfileRequestDTO;
import com.initialrelase.ScopeBackend.Dto.ProfileResponseDTO;
import com.initialrelase.ScopeBackend.Entity.User;
import com.initialrelase.ScopeBackend.Repository.*;
import com.initialrelase.ScopeBackend.Security.AuthenticatorForUsernameAndPass;
import com.initialrelase.ScopeBackend.Service.IProfileService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class ProfileServiceImp implements IProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticatorForUsernameAndPass authenticatorForUsernameAndPass;

    private final TeamMemberRepository teamRepository;
    private final IssueRepository issueRepository;
    private final SprintRepository sprintRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public ProfileResponseDTO updateProfile(ProfileRequestDTO dto) {

        // 1. Fetch current user
        User currentUser = userRepository.findByEmail(dto.getActualEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldWorkspaceName = currentUser.getWorkspaceName();
        String newWorkspaceName = dto.getWorkspaceName();

        // 2. Check if the workspace name actually changed
        boolean isWorkspaceNameChanged = oldWorkspaceName != null
                && !oldWorkspaceName.equals(newWorkspaceName);

        // 3. Update the User profile
        currentUser.setWorkspaceName(newWorkspaceName);
        currentUser.setName(dto.getName());
        currentUser.setEmail(dto.getEmail());
        userRepository.save(currentUser);

        // 4. Cascade the update to all related tables
        if (isWorkspaceNameChanged) {
            teamRepository.updateWorkspaceName(oldWorkspaceName, newWorkspaceName);
            issueRepository.updateWorkspaceName(oldWorkspaceName, newWorkspaceName);
            sprintRepository.updateWorkspaceName(oldWorkspaceName, newWorkspaceName);
            departmentRepository.updateWorkspaceName(oldWorkspaceName, newWorkspaceName);
        }

        // 5. Return updated DTO
        ProfileResponseDTO response = new ProfileResponseDTO();
        response.setWorkspaceName(currentUser.getWorkspaceName());
        response.setName(currentUser.getName());
        response.setEmail(currentUser.getEmail());
        response.setRoles(currentUser.getRoles());

        return response;
    }

    @Override
    public ResponseEntity<?> changePassword(PassChangeDTO passChangeDTO) {
        Optional<User> userOptional = userRepository.findByEmail(passChangeDTO.getActualEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(passChangeDTO.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(passChangeDTO.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok().body("Password changed successfully");
    }

    @Override
    public ProfileResponseDTO findByEmail() {
        User user = getAuthenticatedUser();
        return changeFormat(user);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email).
                orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private ProfileResponseDTO changeFormat(User user) {
        ProfileResponseDTO ProfileResponseDTO = new ProfileResponseDTO();
        BeanUtils.copyProperties(user, ProfileResponseDTO);
        return ProfileResponseDTO;
    }
}