package com.initialrelase.ScopeBackend.Controller;


import com.initialrelase.ScopeBackend.Dto.PassChangeDTO;
import com.initialrelase.ScopeBackend.Dto.ProfileRequestDTO;
import com.initialrelase.ScopeBackend.Dto.ProfileResponseDTO;
import com.initialrelase.ScopeBackend.Service.IProfileService;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final IProfileService profileService;
    @PutMapping
    public ResponseEntity<ProfileResponseDTO> updateProfile(@Valid @RequestBody ProfileRequestDTO profileRequestDTO) {
        return ResponseEntity.ok(profileService.updateProfile(profileRequestDTO));
    }
    @PutMapping("/changePassword")
    public ResponseEntity<ResponseEntity<?>> changePassword(@Valid @RequestBody PassChangeDTO passChangeDTO) {
    return ResponseEntity.ok(profileService.changePassword(passChangeDTO));}
    @GetMapping
    public ResponseEntity<ProfileResponseDTO> getProfile() {
        return ResponseEntity.ok(profileService.findByEmail());
    }
}
