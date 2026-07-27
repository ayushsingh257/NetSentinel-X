package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupLoginRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/login", LoginHandler)
	return r
}

func TestLoginHandler_AdminValidCredentials(t *testing.T) {
	r := setupLoginRouter()

	body := []byte(`{"username":"admin","password":"Admin@NetSentinel2026!"}`)
	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, "admin", resp["role"])
	assert.NotEmpty(t, resp["token"])
	// Ensure we get a real JWT (3 dot-separated segments) not a hardcoded string
	token := resp["token"].(string)
	parts := 0
	for _, ch := range token {
		if ch == '.' {
			parts++
		}
	}
	assert.Equal(t, 2, parts, "Expected real JWT with 3 segments separated by 2 dots")
}

func TestLoginHandler_AnalystValidCredentials(t *testing.T) {
	r := setupLoginRouter()

	body := []byte(`{"username":"analyst","password":"Analyst@NetSentinel2026!"}`)
	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, "analyst", resp["role"])
	assert.NotEmpty(t, resp["token"])
}

func TestLoginHandler_OldPasswordRejected(t *testing.T) {
	// Old credentials "admin"/"admin" must now be rejected
	r := setupLoginRouter()

	body := []byte(`{"username":"admin","password":"admin"}`)
	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestLoginHandler_WrongPassword(t *testing.T) {
	r := setupLoginRouter()

	body := []byte(`{"username":"admin","password":"wrongpassword"}`)
	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestLoginHandler_UnknownUser(t *testing.T) {
	r := setupLoginRouter()

	body := []byte(`{"username":"hacker","password":"anypass"}`)
	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestLoginHandler_MissingFields(t *testing.T) {
	r := setupLoginRouter()

	body := []byte(`{"username":"admin"}`)
	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}
