package edu.umkc.teamstorming.bank_api.authTest;

import edu.umkc.teamstorming.bank_api.auth.JwtTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenServiceTest {

    private JwtTokenService tokenService;

    // Must be 32+ characters for HS256
    private static final String SECRET = "this-is-a-super-secret-key-12345";

    @BeforeEach
    void setUp() {
        tokenService = new JwtTokenService(SECRET, "bank-api", 60);
    }

    @Test
    void issueToken_returnsNonNullToken() {
        String token = tokenService.issueToken("user@example.com");
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void validateAndGetEmail_validToken_returnsEmail() {
        String token = tokenService.issueToken("user@example.com");
        String email = tokenService.validateAndGetEmail(token);
        assertEquals("user@example.com", email);
    }

    @Test
    void validateAndGetEmail_invalidToken_returnsNull() {
        String email = tokenService.validateAndGetEmail("this.is.not.valid");
        assertNull(email);
    }

    @Test
    void validateAndGetEmail_expiredToken_returnsNull() {
        // expMinutes = 0 causes immediate expiry
        JwtTokenService shortService = new JwtTokenService(SECRET, "bank-api", 0);
        String token = shortService.issueToken("user@example.com");
        String email = tokenService.validateAndGetEmail(token);
        assertNull(email);
    }

    @Test
    void validateAndGetEmail_wrongIssuer_returnsNull() {
        JwtTokenService otherService = new JwtTokenService(SECRET, "other-issuer", 60);
        String token = otherService.issueToken("user@example.com");
        String email = tokenService.validateAndGetEmail(token);
        assertNull(email);
    }
}