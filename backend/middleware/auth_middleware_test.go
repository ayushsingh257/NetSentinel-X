package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func setupProtectedRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/protected", AuthMiddleware(), func(c *gin.Context) {
		role, _ := c.Get("role")
		c.JSON(http.StatusOK, gin.H{"message": "authorized", "role": role})
	})
	return r
}

func TestProtectedRouteWithoutToken(t *testing.T) {
	r := setupProtectedRouter()
	req, _ := http.NewRequest("GET", "/protected", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 but got %d", w.Code)
	}
}

func TestProtectedRouteWithInvalidToken(t *testing.T) {
	r := setupProtectedRouter()
	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer invalidtoken123")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 but got %d", w.Code)
	}
}

// TestProtectedRoute_HardcodedTokenNowRejected ensures the old bypass no longer works.
func TestProtectedRoute_HardcodedTokenNowRejected(t *testing.T) {
	r := setupProtectedRouter()
	req, _ := http.NewRequest("GET", "/protected", nil)
	// Old system accepted this; new JWT system must reject it
	req.Header.Set("Authorization", "Bearer admin-token")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 for hardcoded token bypass attempt, but got %d", w.Code)
	}
}

func TestProtectedRouteWithValidJWT(t *testing.T) {
	r := setupProtectedRouter()

	// Generate a real signed JWT
	token, _, err := GenerateToken("usr-001", "admin", "admin")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200 with valid JWT but got %d", w.Code)
	}
}

func TestProtectedRouteWithAnalystJWT(t *testing.T) {
	r := setupProtectedRouter()

	token, _, err := GenerateToken("usr-002", "analyst", "analyst")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200 with valid analyst JWT but got %d", w.Code)
	}
}

func TestProtectedRouteMalformedHeader(t *testing.T) {
	r := setupProtectedRouter()
	req, _ := http.NewRequest("GET", "/protected", nil)
	// Missing "Bearer " prefix
	token, _, _ := GenerateToken("usr-001", "admin", "admin")
	req.Header.Set("Authorization", token) // No "Bearer " prefix
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 for malformed header but got %d", w.Code)
	}
}
