package websocket

import (
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Client struct {
	Connection *websocket.Conn
	Role       string
}

var clients = make(map[*Client]bool)

var mutex sync.Mutex

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

		log.Println("WebSocket upgrade failed:", err)

		return
	}

	client := &Client{
		Connection: conn,
		Role:       role,
	}

	mutex.Lock()

	clients[client] = true

	mutex.Unlock()

	log.Println("🔌 Secure WebSocket Client Connected:", role)

	// =====================================
	// INITIAL SOC MESSAGE
	// =====================================

	welcomeMessage := `
🚀 NETSENTINEL-X THREAT STREAM ACTIVE
📡 Real-Time SOC Monitoring Enabled
🛡 Threat Intelligence Connected
`

	err = conn.WriteMessage(
		websocket.TextMessage,
		[]byte(welcomeMessage),
	)

	if err != nil {

		log.Println("Welcome message failed:", err)
	}

	for {

		_, _, err := conn.ReadMessage()

		if err != nil {

			mutex.Lock()

			delete(clients, client)

			mutex.Unlock()

			conn.Close()

			log.Println("❌ WebSocket Client Disconnected")

			break
		}
	}
}

func BroadcastTraffic(message string) {

	mutex.Lock()

	defer mutex.Unlock()

	for client := range clients {

		err := client.Connection.WriteMessage(
			websocket.TextMessage,
			[]byte(message),
		)

		if err != nil {

			client.Connection.Close()

			delete(clients, client)

			log.Println("⚠️ Removed Dead WebSocket Client")
		}
	}
}

func BroadcastThreat(threat string) {

	mutex.Lock()

	defer mutex.Unlock()

	for client := range clients {

		threatMessage := "🚨 THREAT DETECTED: " + threat

		err := client.Connection.WriteMessage(
			websocket.TextMessage,
			[]byte(threatMessage),
		)

		if err != nil {

			client.Connection.Close()

			delete(clients, client)
		}
	}
}
