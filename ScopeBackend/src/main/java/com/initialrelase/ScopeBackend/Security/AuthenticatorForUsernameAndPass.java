package com.initialrelase.ScopeBackend.Security;
import com.initialrelase.ScopeBackend.Entity.TeamMember;
import com.initialrelase.ScopeBackend.Entity.User;
import com.initialrelase.ScopeBackend.Repository.TeamMemberRepository;
import com.initialrelase.ScopeBackend.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class AuthenticatorForUsernameAndPass implements AuthenticationProvider {

    private final UserRepository userRepository;
    private final TeamMemberRepository teamRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String email = authentication.getName();
        String password = authentication.getCredentials().toString();


        Optional<User> adminUser = userRepository.findByEmail(email);
        if (adminUser.isPresent() && passwordEncoder.matches(password, adminUser.get().getPassword())) {
            User user = adminUser.get();
            List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority(role.getName()))
                    .collect(Collectors.toList());
            return new UsernamePasswordAuthenticationToken(user, null, authorities);
        }

        throw new BadCredentialsException("Invalid username or password");
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}