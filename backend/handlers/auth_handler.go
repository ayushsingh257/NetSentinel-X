package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func LoginHandler(c *gin.Context) {

	var request LoginRequest

	if err := c.BindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})

		return
	}

	if request.Username == "admin" &&
		request.Password == "netsentinel123" {

		c.JSON(http.StatusOK, gin.H{
			"token": "admin-token",
			"role":  "admin",
		})

		return
	}

	if request.Username == "analyst" &&
		request.Password == "analyst123" {

		c.JSON(http.StatusOK, gin.H{
			"token": "analyst-token",
			"role":  "analyst",
		})

		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{
		"error": "Invalid credentials",
	})
}