package services

import (
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestAPISecurityServices(t *testing.T) {
	keyService := NewAPIKeyService()
	oauthService := NewOAuthService()
	sigService := NewRequestSignatureService()
	abuseEngine := NewAPIAbuseDetectionEngine(nil, nil)

	t.Run("API Key Generation & Hashing", func(t *testing.T) {
		plaintext, keyObj := keyService.GenerateAPIKey("Test Key", "USR-100", []string{"VIEW_INCIDENTS"}, 30)
		assert.Contains(t, plaintext, "nsx_live_")
		assert.Equal(t, "ACTIVE", keyObj.Status)

		valid, _, foundKey := keyService.ValidateAPIKey(plaintext)
		assert.True(t, valid)
		assert.Equal(t, keyObj.ID, foundKey.ID)
	})

	t.Run("API Key Invalid & Revocation", func(t *testing.T) {
		valid, errCode, _ := keyService.ValidateAPIKey("wrong_key_format")
		assert.False(t, valid)
		assert.Equal(t, "INVALID_API_KEY", errCode)

		plaintext, keyObj := keyService.GenerateAPIKey("Temp Key", "USR-101", nil, 30)
		keyService.RevokeAPIKey(keyObj.ID)
		validRev, errRev, _ := keyService.ValidateAPIKey(plaintext)
		assert.False(t, validRev)
		assert.Equal(t, "API_KEY_REVOKED", errRev)
	})

	t.Run("OAuth Client Registration & Scopes", func(t *testing.T) {
		clientID, clientSecret, client := oauthService.RegisterClient([]string{"incidents:read", "soar:execute"}, []string{"https://app.test/cb"})
		assert.Contains(t, clientID, "client_")
		assert.Contains(t, clientSecret, "secret_")

		valid, foundClient := oauthService.ValidateClientCredentials(clientID, clientSecret)
		assert.True(t, valid)
		assert.Equal(t, client.ID, foundClient.ID)

		validScopes := oauthService.ValidateScopes(foundClient, []string{"incidents:read"})
		assert.True(t, validScopes)

		invalidScopes := oauthService.ValidateScopes(foundClient, []string{"admin:all"})
		assert.False(t, invalidScopes)
	})

	t.Run("HMAC Signature Verification & Replay Protection", func(t *testing.T) {
		secret := "my_shared_secret_key"
		body := []byte(`{"action":"ISOLATE_HOST","host":"192.168.1.100"}`)

		// Generate valid signature
		nowTs := fmtTimestampNow()
		sig := sigService.ComputeSignature(body, nowTs, secret)

		valid, _ := sigService.VerifySignature(body, nowTs, sigService.ComputeSignature(body, nowTs, secret), secret)
		assert.True(t, valid)

		// Test 3: Modified body -> 403 / Mismatch
		tamperedBody := []byte(`{"action":"ISOLATE_HOST","host":"10.0.0.1"}`)
		validTampered, reasonTampered := sigService.VerifySignature(tamperedBody, nowTs, sigService.ComputeSignature(body, nowTs, secret), secret)
		assert.False(t, validTampered)
		assert.Equal(t, "SIGNATURE_MISMATCH_TAMPERED_BODY", reasonTampered)

		// Test 4: Replay attack (Old timestamp 10 minutes ago)
		oldTimestampStr := fmt.Sprintf("%d", time.Now().Add(-10*time.Minute).Unix())
		validOld, reasonOld := sigService.VerifySignature(body, oldTimestampStr, sig, secret)
		assert.False(t, validOld)
		assert.Contains(t, reasonOld, "TIMESTAMP_EXPIRED_REPLAY_RISK")
	})

	t.Run("API Abuse Inspection", func(t *testing.T) {
		evt := abuseEngine.InspectRequest("10.0.0.99", "/api/v2/admin/debug", 200)
		assert.NotNil(t, evt)
		assert.Equal(t, "ENDPOINT_ENUMERATION", evt.AbuseType)
	})
}

func fmtTimestampNow() string {
	return fmt.Sprintf("%d", time.Now().Unix())
}
