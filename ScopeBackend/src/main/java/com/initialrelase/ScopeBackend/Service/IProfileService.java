package com.initialrelase.ScopeBackend.Service;

import com.initialrelase.ScopeBackend.Dto.PassChangeDTO;
import com.initialrelase.ScopeBackend.Dto.ProfileRequestDTO;

import com.initialrelase.ScopeBackend.Dto.ProfileResponseDTO;
import com.initialrelase.ScopeBackend.Entity.User;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

public interface IProfileService {
 ProfileResponseDTO updateProfile(ProfileRequestDTO  profileRequestDTO);
 ResponseEntity<?> changePassword(PassChangeDTO  passChangeDTO);
 ProfileResponseDTO findByEmail();

}
