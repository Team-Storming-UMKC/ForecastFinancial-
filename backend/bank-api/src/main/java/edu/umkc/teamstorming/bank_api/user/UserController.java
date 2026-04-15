package edu.umkc.teamstorming.bank_api.user;

import edu.umkc.teamstorming.bank_api.transaction.TransactionRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          TransactionRepository transactionRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record UserProfileResponse(
            String firstName,
            String lastName,
            String email,
            LocalDate dateOfBirth,
            String profilePictureUrl
    ) {}

    public record UpdateProfileRequest(
            String firstName,
            String lastName,
            @Email String email,
            LocalDate dateOfBirth,
            String profilePictureUrl
    ) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank String newPassword
    ) {}

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User user = findUser(auth.getName());
        return ResponseEntity.ok(toResponse(user));
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateMe(@Valid @RequestBody UpdateProfileRequest request, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User user = findUser(auth.getName());

        if (request.firstName() != null) {
            String firstName = request.firstName().trim();
            if (firstName.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "First name cannot be blank"));
            }
            user.setFirstName(firstName);
        }

        if (request.lastName() != null) {
            String lastName = request.lastName().trim();
            if (lastName.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Last name cannot be blank"));
            }
            user.setLastName(lastName);
        }

        if (request.email() != null) {
            String normalizedEmail = request.email().trim().toLowerCase();
            if (!normalizedEmail.equals(user.getEmail()) && userRepository.existsByEmail(normalizedEmail)) {
                return ResponseEntity.status(409).body(Map.of("error", "Email already in use"));
            }
            user.setEmail(normalizedEmail);
        }

        if (request.dateOfBirth() != null) {
            user.setDateOfBirth(request.dateOfBirth());
        }

        if (request.profilePictureUrl() != null) {
            String profilePictureUrl = request.profilePictureUrl().trim();
            user.setProfilePictureUrl(profilePictureUrl.isEmpty() ? null : profilePictureUrl);
        }

        userRepository.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User user = findUser(auth.getName());

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Current password is incorrect"));
        }

        if (request.currentPassword().equals(request.newPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be different"));
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("status", "password-updated"));
    }

    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<?> deleteMe(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User user = findUser(auth.getName());
        transactionRepository.deleteByUserId(user.getId());
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of("status", "account-deleted"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getDateOfBirth(),
                user.getProfilePictureUrl()
        );
    }
}
