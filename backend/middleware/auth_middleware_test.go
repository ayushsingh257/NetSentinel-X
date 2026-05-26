package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestProtectedRouteWithoutToken(t *testing.T) {

	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.GET(
		"/protected",
		AuthMiddleware(),
		func(c *gin.Context) {

			c.JSON(http.StatusOK, gin.H{
				"message": "authorized",
			})
		},
	)

	req, _ := http.NewRequest(
		"GET",
		"/protected",
		nil,
	)

	response := httptest.NewRecorder()

	router.ServeHTTP(response, req)

	if response.Code != http.StatusUnauthorized {

		t.Errorf(
			"Expected status 401 but got %d",
			response.Code,
		)
	}
}

func TestProtectedRouteWithInvalidToken(t *testing.T) {

	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.GET(
		"/protected",
		AuthMiddleware(),
		func(c *gin.Context) {

			c.JSON(http.StatusOK, gin.H{
				"message": "authorized",
			})
		},
	)

	req, _ := http.NewRequest(
		"GET",
		"/protected",
		nil,
	)

	req.Header.Set(
		"Authorization",
		"Bearer invalidtoken123",
	)

	response := httptest.NewRecorder()

	router.ServeHTTP(response, req)

	if response.Code != http.StatusUnauthorized {

		t.Errorf(
			"Expected status 401 but got %d",
			response.Code,
		)
	}
}

func TestProtectedRouteWithValidAdminToken(t *testing.T) {

	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.GET(
		"/protected",
		AuthMiddleware(),
		func(c *gin.Context) {

			role, _ := c.Get("role")

			c.JSON(http.StatusOK, gin.H{
				"message": "authorized",
				"role": role,
			})
		},
	)

	req, _ := http.NewRequest(
		"GET",
		"/protected",
		nil,
	)

	req.Header.Set(
		"Authorization",
		"Bearer admin-token",
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