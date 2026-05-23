package websocket

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(
		c.Writer,
		c.Request,
		nil,
	)

	if err != nil {
		log.Println(err)
		return
	}

	clients[conn] = true

	log.Println("New WebSocket Client Connected")

	for {
		_, _, err := conn.ReadMessage()

		if err != nil {
			delete(clients, conn)
			conn.Close()
			break
		}
	}
}

func BroadcastTraffic(message string) {
	for client := range clients {

		err := client.WriteMessage(
			websocket.TextMessage,
			[]byte(message),
		)

		if err != nil {
			client.Close()
			delete(clients, client)
		}
	}
}