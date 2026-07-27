package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"netsentinel-x-backend/middleware"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupAuthRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	authHandler := NewV2AuthHandler()

	// Public routes
	r.POST("/login", LoginHandler)

	// Protected auth routes
	protected := r.Group("/api/auth")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/me", authHandler.GetMe)
		protected.GET("/session/validate", authHandler.ValidateSession)
		protected.POST("/refresh", authHandler.RefreshToken)
		protected.POST("/logout", authHandler.Logout)
	}

	return r
}

func generateTestToken(t *testing.T, userID, username, role string) string {
	t.Helper()
	token, _, err := middleware.GenerateToken(userID, username, role)
	assert.NoError(t, err)
	return token
}

// TestLoginHandler_HardcodedTokenRejectedViaAuth verifies the old bypass no longer works.
func TestLoginHandler_HardcodedTokenRejectedViaAuth(t *testing.T) {
	r := setupAuthRouter()

	req := httptest.NewRequest(http.MethodGet, "/api/auth/me", nil)
	req.Header.Set("Authorization", "Bearer admin-token")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Old system would accept this; new system must reject it
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// --- Session Validation Tests ---

func TestGetMe_ValidToken(t *testing.T) {
	r := setupAuthRouter()
	token := generateTestToken(t, "usr-001", "admin", "admin")

	req := httptest.NewRequest(http.MethodGet, "/api/auth/me", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, true, resp["session_valid"])
	assert.Equal(t, "admin", resp["role"])
}

func TestValidateSession_NoToken(t *testing.T) {
	r := setupAuthRouter()

	req := httptest.NewRequest(http.MethodGet, "/api/auth/session/validate", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestValidateSession_FakeToken(t *testing.T) {
	r := setupAuthRouter()

	req := httptest.NewRequest(http.MethodGet, "/api/auth/session/validate", nil)
	req.Header.Set("Authorization", "Bearer totally.fake.token")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestValidateSession_TamperedToken(t *testing.T) {
	r := setupAuthRouter()
	token := generateTestToken(t, "usr-001", "admin", "admin")
	tampered := token[:len(token)-5] + "XXXXX"

	req := httptest.NewRequest(http.MethodGet, "/api/auth/session/validate", nil)
	req.Header.Set("Authorization", "Bearer "+tampered)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestRefreshToken_ValidToken(t *testing.T) {
	r := setupAuthRouter()
	token := generateTestToken(t, "usr-001", "admin", "admin")

	req := httptest.NewRequest(http.MethodPost, "/api/auth/refresh", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NotEmpty(t, resp["token"])
}

func TestLogout_ValidToken(t *testing.T) {
	r := setupAuthRouter()
	token := generateTestToken(t, "usr-001", "admin", "admin")

	req := httptest.NewRequest(http.MethodPost, "/api/auth/logout", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}
