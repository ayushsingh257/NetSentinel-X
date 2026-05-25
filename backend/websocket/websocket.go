package websocket

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Client struct {
	Connection *websocket.Conn
	Role       string
}

var clients = make(map[*Client]bool)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleWebSocket(c *gin.Context) {

	authHeader := c.Query("token")

	if authHeader == "" {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Missing token",
		})

		return
	}

	token := authHeader

	role := ""

	if token == "admin-token" {

		role = "admin"

	} else if token == "analyst-token" {

		role = "analyst"

	} else {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token",
		})

		return
	}

	conn, err := upgrader.Upgrade(
		c.Writer,
		c.Request,
		nil,
	)

	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{
		Connection: conn,
		Role:       role,
	}

	clients[client] = true

	log.Println("Secure WebSocket Client Connected:", role)

	for {

		_, _, err := conn.ReadMessage()

		if err != nil {

			delete(clients, client)

			conn.Close()

			break
		}
	}
}

func BroadcastTraffic(message string) {

	for client := range clients {

		err := client.Connection.WriteMessage(
			websocket.TextMessage,
			[]byte(message),
		)

		if err != nil {

			client.Connection.Close()

			delete(clients, client)
		}
	}
}