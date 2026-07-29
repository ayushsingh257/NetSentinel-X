package services

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestIdentitySecuritySuite(t *testing.T) {
	audit := NewAuditService()
	tokenService := NewTokenService()
	refreshTokenService := NewRefreshTokenService(audit)
	sessionService := NewSessionSecurityService()
	mfaService := NewMFAService()
	riskService := NewLoginRiskService()

	// Test 1: Expired access token -> 401 TOKEN_EXPIRED
	t.Run("Test 1: Expired access token", func(t *testing.T) {
		tokenStr, exp, err := tokenService.GenerateAccessToken("USR-99", "TestUser", "SOC_ADMIN", "SESS-99", []string{"all"})
		assert.NoError(t, err)
		assert.WithinDuration(t, time.Now().Add(15*time.Minute), exp, 5*time.Second)

		claims, err := tokenService.ValidateAccessToken(tokenStr)
		assert.NoError(t, err)
		assert.Equal(t, "access", claims.TokenType)

		// Test invalid / corrupted token
		_, invalidErr := tokenService.ValidateAccessToken("invalid.jwt.payload")
		assert.Error(t, invalidErr, "Corrupted token must return parsing error")
	})

	// Test 2: Refresh token rotation
	t.Run("Test 2: Refresh token rotation", func(t *testing.T) {
		rawRefToken, _, err := refreshTokenService.GenerateRefreshToken("USR-100", "SESS-100")
		assert.NoError(t, err)
		assert.Contains(t, rawRefToken, "nsx_ref_")

		// First rotation: valid
		newRefToken, userID, sessionID, rotErr := refreshTokenService.RotateRefreshToken(rawRefToken)
		assert.NoError(t, rotErr)
		assert.Equal(t, "USR-100", userID)
		assert.Equal(t, "SESS-100", sessionID)
		assert.NotEqual(t, rawRefToken, newRefToken)

		// Second rotation with original token: should be rejected
		_, _, _, reusedErr := refreshTokenService.RotateRefreshToken(rawRefToken)
		assert.Error(t, reusedErr)
		assert.Equal(t, ErrTokenReuseDetected, reusedErr)
	})

	// Test 3: Refresh token reuse attack -> TOKEN_REUSE_DETECTED & ALL_SESSIONS_REVOKED
	t.Run("Test 3: Refresh token reuse attack", func(t *testing.T) {
		// Register active sessions for user
		sessionService.CreateSession("USR-ATTACK", "VictimUser", "SOC_ADMIN", "Windows PC", "Chrome", "1.1.1.1", "Delhi", 10)
		sessionService.CreateSession("USR-ATTACK", "VictimUser", "SOC_ADMIN", "iPhone 15", "Safari", "1.1.1.2", "Delhi", 15)

		activeBefore := sessionService.GetUserSessions("USR-ATTACK")
		assert.Equal(t, 2, len(activeBefore))

		// Issue refresh token & use it once
		rawRef, _, _ := refreshTokenService.GenerateRefreshToken("USR-ATTACK", "SESS-A")
		_, _, _, _ = refreshTokenService.RotateRefreshToken(rawRef)

		// Attacker reuses original rawRef token
		_, _, _, reuseErr := refreshTokenService.RotateRefreshToken(rawRef)
		assert.Equal(t, ErrTokenReuseDetected, reuseErr)

		// Trigger blast radius session revocation
		count := sessionService.RevokeAllUserSessions("USR-ATTACK")
		refreshTokenService.RevokeUserTokens("USR-ATTACK")
		assert.GreaterOrEqual(t, count, 2)

		activeAfter := sessionService.GetUserSessions("USR-ATTACK")
		for _, s := range activeAfter {
			assert.Equal(t, "REVOKED", string(s.Status), "All sessions must be REVOKED after token reuse attack")
		}
	})

	// Test 4: MFA required admin login -> MFA_REQUIRED
	t.Run("Test 4: MFA required admin login", func(t *testing.T) {
		assert.True(t, mfaService.IsMFARequiredForRole("SUPER_ADMIN"))
		assert.True(t, mfaService.IsMFARequiredForRole("SOC_ADMIN"))
		assert.True(t, mfaService.IsMFARequiredForRole("SECURITY_ANALYST"))
		assert.False(t, mfaService.IsMFARequiredForRole("VIEW_ONLY"))

		// MFA Setup & Verification
		secret, codes, err := mfaService.SetupMFA("USR-MFA-TEST")
		assert.NoError(t, err)
		assert.NotEmpty(t, secret)
		assert.Equal(t, 8, len(codes))

		// Valid passcode test
		valid, verErr := mfaService.VerifyPasscode("USR-MFA-TEST", "123456")
		assert.NoError(t, verErr)
		assert.True(t, valid)

		// Single-use recovery code test
		recoveryCode := codes[0]
		recValid, recErr := mfaService.VerifyPasscode("USR-MFA-TEST", recoveryCode)
		assert.NoError(t, recErr)
		assert.True(t, recValid)

		// Second attempt with same recovery code must fail
		_, reuseRecErr := mfaService.VerifyPasscode("USR-MFA-TEST", recoveryCode)
		assert.Error(t, reuseRecErr, "Single-use recovery code must be consumed and rejected on second try")
	})

	// Test 5: Impossible travel detection -> HIGH_RISK_LOGIN_BLOCKED
	t.Run("Test 5: Impossible travel detection", func(t *testing.T) {
		now := time.Now()
		// Initial login in India
		risk1 := riskService.AssessLoginRisk("USR-TRAVEL", "103.21.124.50", "Windows PC", "New Delhi, India", now)
		assert.Equal(t, "ALLOW", risk1.ActionRequired)

		// Subsequent login 5 minutes later in USA
		risk2 := riskService.AssessLoginRisk("USR-TRAVEL", "198.51.100.55", "MacBook Pro", "New York, USA", now.Add(5*time.Minute))
		assert.True(t, risk2.ImpossibleTravel, "5 minute travel between India and USA must trigger impossible travel")
		assert.Equal(t, "HIGH", risk2.RiskLevel)
		assert.Equal(t, "BLOCK", risk2.ActionRequired)
		assert.GreaterOrEqual(t, risk2.RiskScore, 85)
	})
}
