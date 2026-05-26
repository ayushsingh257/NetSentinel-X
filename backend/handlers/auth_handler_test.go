package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestLoginHandler(t *testing.T) {

	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.POST("/login", LoginHandler)

	jsonBody := []byte(`{
		"username":"admin",
		"password":"admin"
	}`)

	req, _ := http.NewRequest(
		"POST",
		"/login",
		bytes.NewBuffer(jsonBody),
	)

	req.Header.Set(
		"Content-Type",
		"application/json",
	)

	response := httptest.NewRecorder()

	router.ServeHTTP(response, req)

	if response.Code != http.StatusOK {

		t.Errorf(
			"Expected status 200 but got %d",
			response.Code,
		)
	}
}