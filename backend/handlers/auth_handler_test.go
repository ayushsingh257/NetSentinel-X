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
	r.POST("/signup", SignupHandler)
	r.POST("/logout", LogoutHandler)
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

func TestSignupHandler_SuccessAndImmediateLogin(t *testing.T) {
	r := setupLoginRouter()

	signupBody := []byte(`{
		"firstName": "Jane",
		"lastName": "Doe",
		"username": "janedoe_sec",
		"email": "jane.doe@enterprise.com",
		"password": "SecurePassword2026!",
		"role": "engineer"
	}`)
	req, _ := http.NewRequest("POST", "/signup", bytes.NewBuffer(signupBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, "engineer", resp["role"])
	assert.Equal(t, "janedoe_sec", resp["username"])
	assert.NotEmpty(t, resp["token"])

	// Verify immediate login with the newly created account
	loginBody := []byte(`{"username":"janedoe_sec","password":"SecurePassword2026!"}`)
	loginReq, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(loginBody))
	loginReq.Header.Set("Content-Type", "application/json")
	loginW := httptest.NewRecorder()
	r.ServeHTTP(loginW, loginReq)

	assert.Equal(t, http.StatusOK, loginW.Code)
	var loginResp map[string]interface{}
	json.Unmarshal(loginW.Body.Bytes(), &loginResp)
	assert.Equal(t, "engineer", loginResp["role"])
}

func TestSignupHandler_AdminRoleForbidden(t *testing.T) {
	r := setupLoginRouter()

	signupBody := []byte(`{
		"firstName": "Attacker",
		"lastName": "User",
		"username": "attacker_admin",
		"email": "attacker@evil.com",
		"password": "SuperSecretPass123!",
		"role": "admin"
	}`)
	req, _ := http.NewRequest("POST", "/signup", bytes.NewBuffer(signupBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

func TestSignupHandler_WeakPasswordRejected(t *testing.T) {
	r := setupLoginRouter()

	signupBody := []byte(`{
		"username": "weakuser",
		"email": "weak@enterprise.com",
		"password": "weak",
		"role": "analyst"
	}`)
	req, _ := http.NewRequest("POST", "/signup", bytes.NewBuffer(signupBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestSignupHandler_InvalidEmailRejected(t *testing.T) {
	r := setupLoginRouter()

	signupBody := []byte(`{
		"username": "bademailuser",
		"email": "not-an-email",
		"password": "StrongPassword123!",
		"role": "analyst"
	}`)
	req, _ := http.NewRequest("POST", "/signup", bytes.NewBuffer(signupBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestSignupHandler_DuplicateUsernameRejected(t *testing.T) {
	r := setupLoginRouter()

	signupBody := []byte(`{
		"username": "admin",
		"email": "newadmin@enterprise.com",
		"password": "StrongPassword123!",
		"role": "analyst"
	}`)
	req, _ := http.NewRequest("POST", "/signup", bytes.NewBuffer(signupBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusConflict, w.Code)
}

func TestLogoutHandler_Success(t *testing.T) {
	r := setupLoginRouter()

	req, _ := http.NewRequest("POST", "/logout", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}
