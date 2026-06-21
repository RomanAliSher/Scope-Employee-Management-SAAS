package com.initialrelase.ScopeBackend.Controller;

import com.initialrelase.ScopeBackend.Dto.*;
import com.initialrelase.ScopeBackend.Entity.User;
import com.initialrelase.ScopeBackend.Repository.UserRepository;
import com.initialrelase.ScopeBackend.Security.JwtService;
import com.initialrelase.ScopeBackend.Service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor

public class AuthController {


    private final UserRepository userRepository;
    private final IUserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;


    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDTO userRegistrationDTO) {

        Optional<User> existingUser = userRepository.findByEmail(userRegistrationDTO.getEmail());

        if (existingUser.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("email", "Email already exists");
            return ResponseEntity.badRequest().body(error);
        }

        userService.createUser(userRegistrationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body("Customer created successfully");
    }



    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        try {
            //  checks the email and password against the database
            //this is the class we made by name AuthenticationForUsernameAndPass
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequestDTO.email(),
                            loginRequestDTO.password()
                    )
            );
            //created new customer  to send to the frontend
            var user=new CustomerDTO();

            user.setRoles(authentication.getAuthorities().stream().map(
                    GrantedAuthority::getAuthority).collect(Collectors.joining(",")));
           //got the existing user entity by authentication
            User loggedinUser = (User) authentication.getPrincipal();
            BeanUtils.copyProperties(loggedinUser,user);
            //   generate the JWT token with help of jwt service class
            String jwt = jwtService.generateToken(authentication);
            return ResponseEntity.ok(new LoginResponseDTO("Login Successful", jwt, user));


        } catch (UsernameNotFoundException _){
            return buildErrorResponse(HttpStatus.NOT_FOUND,
                    "User not found");
        }
        catch (BadCredentialsException _) {
            return buildErrorResponse(HttpStatus.UNAUTHORIZED,
                    "Invalid username or password");
        } catch (AuthenticationException _) {
            return buildErrorResponse(HttpStatus.UNAUTHORIZED,
                    "Authentication failed");
        } catch (Exception _) {
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred");
        }
    }
    private ResponseEntity<LoginResponseDTO> buildErrorResponse(HttpStatus status,String message){
        return ResponseEntity.status(status)
                .body(new LoginResponseDTO(message, null, null));
    }

}


