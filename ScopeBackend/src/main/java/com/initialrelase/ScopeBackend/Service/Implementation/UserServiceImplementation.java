package com.initialrelase.ScopeBackend.Service.Implementation;

import com.initialrelase.ScopeBackend.Dto.UserRegistrationDTO;
import com.initialrelase.ScopeBackend.Entity.Role;
import com.initialrelase.ScopeBackend.Entity.User;
import com.initialrelase.ScopeBackend.Repository.UserRepository;
import com.initialrelase.ScopeBackend.Service.IUserService;
import lombok.AllArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@AllArgsConstructor
public class UserServiceImplementation implements IUserService {
    public PasswordEncoder bcryptPasswordEncoder(){return new BCryptPasswordEncoder();}
    private UserRepository userRepository;

    @Override
    public ResponseEntity<?> createUser(UserRegistrationDTO userRegistrationDTO) {
       User user=changeFormat(userRegistrationDTO);
        String hashedPassword = bcryptPasswordEncoder().encode(user.getPassword());
        user.setPassword(hashedPassword);
        Role role = new Role();
        role.setName("ADMIN");
        user.setRoles(Set.of(role));
        userRepository.save(user);
        return ResponseEntity.ok("User created successfully");
    }
    public User changeFormat(UserRegistrationDTO userRegistrationDTO) {
        User user = new User();
        BeanUtils.copyProperties(userRegistrationDTO,user);
        return user;

    }


}
