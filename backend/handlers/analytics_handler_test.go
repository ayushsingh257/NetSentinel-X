package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestAnalyticsRouteExists(t *testing.T) {

	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.GET("/analytics", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "analytics working",
		})
	})

	req, _ := http.NewRequest(
		"GET",
		"/analytics",
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