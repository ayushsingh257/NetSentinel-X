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

	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})

		return
	}

	// ADMIN LOGIN
	if req.Username == "admin" && req.Password == "admin" {

		c.JSON(http.StatusOK, gin.H{
			"token": "admin-token",
			"role":  "admin",
		})

		return
	}

	// ANALYST LOGIN
	if req.Username == "analyst" && req.Password == "analyst" {

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