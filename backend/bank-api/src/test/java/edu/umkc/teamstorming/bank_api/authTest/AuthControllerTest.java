package edu.umkc.teamstorming.bank_api.authTest;

import edu.umkc.teamstorming.bank_api.auth.AuthController;
import edu.umkc.teamstorming.bank_api.auth.JwtTokenService;
import edu.umkc.teamstorming.bank_api.user.User;
import edu.umkc.teamstorming.bank_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    private AuthController authController;
    private JwtTokenService tokenService;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        tokenService = Mockito.mock(JwtTokenService.class);
        userRepository = Mockito.mock(UserRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        authController = new AuthController(tokenService, userRepository, passwordEncoder);
    }

    // ─── REGISTER TESTS ───────────────────────────────────────────

    @Test
    void register_success_returns201() {
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedpassword");

        var request = new AuthController.RegisterRequest(
                "New",
                "User",
                "newuser@example.com",
                "password123",
                LocalDate.of(2000, 1, 1)
        );
        ResponseEntity<?> response = authController.register(request);

        assertEquals(201, response.getStatusCode().value());
        assertEquals(Map.of("status", "created"), response.getBody());
    }

    @Test
    void register_duplicateEmail_returns409() {
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        var request = new AuthController.RegisterRequest(
                "Existing",
                "User",
                "existing@example.com",
                "password123",
                LocalDate.of(2000, 1, 1)
        );
        ResponseEntity<?> response = authController.register(request);

        assertEquals(409, response.getStatusCode().value());
        assertEquals(Map.of("error", "Email already in use"), response.getBody());
    }

    @Test
    void register_emailIsLowercased() {
        when(userRepository.existsByEmail("upper@example.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");

        var request = new AuthController.RegisterRequest(
                "Upper",
                "Case",
                "UPPER@example.com",
                "password123",
                LocalDate.of(2000, 1, 1)
        );
        authController.register(request);

        verify(userRepository).existsByEmail("upper@example.com");
    }

    // ─── LOGIN TESTS ──────────────────────────────────────────────

    @Test
    void login_success_returnsToken() {
        User mockUser = new User("Test", "User", "user@example.com", "hashedpassword", LocalDate.of(2000, 1, 1));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("password123", "hashedpassword")).thenReturn(true);
        when(tokenService.issueToken("user@example.com")).thenReturn("mock.jwt.token");

        var request = new AuthController.LoginRequest("user@example.com", "password123");
        ResponseEntity<?> response = authController.login(request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(Map.of("token", "mock.jwt.token"), response.getBody());
    }

    @Test
    void login_wrongPassword_returns401() {
        User mockUser = new User("Test", "User", "user@example.com", "hashedpassword", LocalDate.of(2000, 1, 1));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrongpassword", "hashedpassword")).thenReturn(false);

        var request = new AuthController.LoginRequest("user@example.com", "wrongpassword");
        ResponseEntity<?> response = authController.login(request);

        assertEquals(401, response.getStatusCode().value());
        assertEquals(Map.of("error", "Invalid credentials"), response.getBody());
    }

    @Test
    void login_userNotFound_returns401() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        var request = new AuthController.LoginRequest("ghost@example.com", "password123");
        ResponseEntity<?> response = authController.login(request);

        assertEquals(401, response.getStatusCode().value());
        assertEquals(Map.of("error", "Invalid credentials"), response.getBody());
    }

    @Test
    void login_emailIsLowercased() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());

        var request = new AuthController.LoginRequest("USER@example.com", "password123");
        authController.login(request);

        verify(userRepository).findByEmail("user@example.com");
    }

    // ─── ME TESTS ─────────────────────────────────────────────────

    @Test
    void me_withValidEmail_returns200() {
        ResponseEntity<?> response = authController.me("user@example.com");

        assertEquals(200, response.getStatusCode().value());
        assertEquals(Map.of("email", "user@example.com", "status", "ok"), response.getBody());
    }

    @Test
    void me_withNullEmail_returns401() {
        ResponseEntity<?> response = authController.me(null);

        assertEquals(401, response.getStatusCode().value());
        assertEquals(Map.of("error", "Unauthorized"), response.getBody());
    }
}
