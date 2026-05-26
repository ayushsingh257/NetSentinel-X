package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestAdminOnlyWithAnalystRole(t *testing.T) {

	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.GET(
		"/admin",
		func(c *gin.Context) {

			c.Set("role", "analyst")

			c.Next()
		},
		AdminOnly(),
		func(c *gin.Context) {

			c.JSON(http.StatusOK, gin.H{
				"message": "admin authorized",
			})
		},
	)

	req, _ := http.NewRequest(
		"GET",
		"/admin",
		nil,
	)

	response := httptest.NewRecorder()

	router.ServeHTTP(response, req)

	if response.Code != http.StatusForbidden {

		t.Errorf(
			"Expected status 403 but got %d",
			response.Code,
		)
	}
}

func TestAdminOnlyWithAdminRole(t *testing.T) {

	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.GET(
		"/admin",
		func(c *gin.Context) {

			c.Set("role", "admin")

			c.Next()
		},
		AdminOnly(),
		func(c *gin.Context) {

			c.JSON(http.StatusOK, gin.H{
				"message": "admin authorized",
			})
		},
	)

	req, _ := http.NewRequest(
		"GET",
		"/admin",
		nil,
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