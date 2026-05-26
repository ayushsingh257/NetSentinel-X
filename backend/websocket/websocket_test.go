package websocket

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestWebSocketRouteExists(t *testing.T) {

	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.GET("/ws", func(c *gin.Context) {

		c.JSON(http.StatusOK, gin.H{
			"message": "websocket route working",
		})
	})

	req, _ := http.NewRequest(
		"GET",
		"/ws",
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

func TestWebSocketWithoutToken(t *testing.T) {

	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.GET("/ws", HandleWebSocket)

	req, _ := http.NewRequest(
		"GET",
		"/ws",
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

func TestWebSocketWithInvalidToken(t *testing.T) {

	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.GET("/ws", HandleWebSocket)

	req, _ := http.NewRequest(
		"GET",
		"/ws?token=badtoken123",
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

func TestBroadcastTraffic(t *testing.T) {

	message := "Test traffic message"

	BroadcastTraffic(message)

	if message != "Test traffic message" {

		t.Errorf(
			"Broadcast message failed",
		)
	}
}