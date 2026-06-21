package com.initialrelase.ScopeBackend.Service;

import com.initialrelase.ScopeBackend.Dto.UserRegistrationDTO;
import org.springframework.http.ResponseEntity;

public interface IUserService {
    ResponseEntity<?> createUser(UserRegistrationDTO userRegistrationDTO);


}
