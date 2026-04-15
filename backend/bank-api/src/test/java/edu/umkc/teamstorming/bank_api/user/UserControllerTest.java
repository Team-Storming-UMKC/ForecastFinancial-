package edu.umkc.teamstorming.bank_api.user;

import edu.umkc.teamstorming.bank_api.transaction.TransactionRepository;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserControllerTest {

    private UserController userController;
    private UserRepository userRepository;
    private TransactionRepository transactionRepository;
    private PasswordEncoder passwordEncoder;
    private Authentication auth;
    private User user;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        transactionRepository = Mockito.mock(TransactionRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        auth = Mockito.mock(Authentication.class);
        when(auth.getName()).thenReturn("user@example.com");

        user = new User("Jane", "Doe", "user@example.com", "hashed-password", LocalDate.of(2001, 5, 10));
        user.setProfilePictureUrl("https://example.com/old.png");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        userController = new UserController(userRepository, transactionRepository, passwordEncoder);
    }

    @Test
    void getMe_returnsUserProfile() {
        ResponseEntity<?> response = userController.getMe(auth);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(
                new UserController.UserProfileResponse(
                        "Jane",
                        "Doe",
                        "user@example.com",
                        LocalDate.of(2001, 5, 10),
                        "https://example.com/old.png"
                ),
                response.getBody()
        );
    }

    @Test
    void updateMe_updatesProvidedFields() {
        when(userRepository.existsByEmail("jane.new@example.com")).thenReturn(false);

        var request = new UserController.UpdateProfileRequest(
                "Janet",
                "Smith",
                "jane.new@example.com",
                LocalDate.of(2000, 1, 1),
                "https://example.com/new.png"
        );

        ResponseEntity<?> response = userController.updateMe(request, auth);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Janet", user.getFirstName());
        assertEquals("Smith", user.getLastName());
        assertEquals("jane.new@example.com", user.getEmail());
        assertEquals(LocalDate.of(2000, 1, 1), user.getDateOfBirth());
        assertEquals("https://example.com/new.png", user.getProfilePictureUrl());
        verify(userRepository).save(user);
    }

    @Test
    void updateMe_rejectsDuplicateEmail() {
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        var request = new UserController.UpdateProfileRequest(
                null,
                null,
                "taken@example.com",
                null,
                null
        );

        ResponseEntity<?> response = userController.updateMe(request, auth);

        assertEquals(409, response.getStatusCode().value());
        assertEquals(Map.of("error", "Email already in use"), response.getBody());
    }

    @Test
    void updateMe_blankProfilePictureClearsField() {
        var request = new UserController.UpdateProfileRequest(
                null,
                null,
                null,
                null,
                "   "
        );

        ResponseEntity<?> response = userController.updateMe(request, auth);

        assertEquals(200, response.getStatusCode().value());
        assertNull(user.getProfilePictureUrl());
    }

    @Test
    void changePassword_updatesHashWhenCurrentPasswordMatches() {
        when(passwordEncoder.matches("current-pass", "hashed-password")).thenReturn(true);
        when(passwordEncoder.encode("new-pass")).thenReturn("new-hash");

        var request = new UserController.ChangePasswordRequest("current-pass", "new-pass");
        ResponseEntity<?> response = userController.changePassword(request, auth);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(Map.of("status", "password-updated"), response.getBody());
        assertEquals("new-hash", user.getPasswordHash());
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_rejectsWrongCurrentPassword() {
        when(passwordEncoder.matches("wrong-pass", "hashed-password")).thenReturn(false);

        var request = new UserController.ChangePasswordRequest("wrong-pass", "new-pass");
        ResponseEntity<?> response = userController.changePassword(request, auth);

        assertEquals(401, response.getStatusCode().value());
        assertEquals(Map.of("error", "Current password is incorrect"), response.getBody());
    }

    @Test
    void changePassword_rejectsSamePassword() {
        when(passwordEncoder.matches("same-pass", "hashed-password")).thenReturn(true);

        var request = new UserController.ChangePasswordRequest("same-pass", "same-pass");
        ResponseEntity<?> response = userController.changePassword(request, auth);

        assertEquals(400, response.getStatusCode().value());
        assertEquals(Map.of("error", "New password must be different"), response.getBody());
    }

    @Test
    void deleteMe_deletesTransactionsThenUser() {
        ResponseEntity<?> response = userController.deleteMe(auth);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(Map.of("status", "account-deleted"), response.getBody());
        verify(transactionRepository).deleteByUserId(user.getId());
        verify(userRepository).delete(user);
    }

    @Test
    void deleteMe_rejectsUnauthorizedRequest() {
        ResponseEntity<?> response = userController.deleteMe(null);

        assertEquals(401, response.getStatusCode().value());
        assertEquals(Map.of("error", "Unauthorized"), response.getBody());
    }
}
