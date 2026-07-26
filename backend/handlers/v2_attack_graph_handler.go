package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2AttackGraphHandler struct {
	graphService *services.AttackGraphService
}

func NewV2AttackGraphHandler() *V2AttackGraphHandler {
	return &V2AttackGraphHandler{
		graphService: services.NewAttackGraphService(),
	}
}

type ExplainPathReq struct {
	PathID string `json:"path_id"`
}

func (h *V2AttackGraphHandler) GetGraph(c *gin.Context) {
	payload := h.graphService.GetGraphPayload()
	c.JSON(http.StatusOK, payload)
}

func (h *V2AttackGraphHandler) GetNodes(c *gin.Context) {
	nodes := h.graphService.GetNodes()
	c.JSON(http.StatusOK, gin.H{
		"nodes": nodes,
		"total": len(nodes),
	})
}

func (h *V2AttackGraphHandler) GetEdges(c *gin.Context) {
	edges := h.graphService.GetEdges()
	c.JSON(http.StatusOK, gin.H{
		"edges": edges,
		"total": len(edges),
	})
}

func (h *V2AttackGraphHandler) GetPathByID(c *gin.Context) {
	id := c.Param("id")
	path, exists := h.graphService.GetPathByID(id)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "attack path not found",
		})
		return
	}
	c.JSON(http.StatusOK, path)
}

func (h *V2AttackGraphHandler) ExplainPath(c *gin.Context) {
	var req ExplainPathReq
	if err := c.ShouldBindJSON(&req); err != nil || req.PathID == "" {
		req.PathID = "PATH-2026-001"
	}

	explanation, path := h.graphService.ExplainPath(req.PathID)
	c.JSON(http.StatusOK, gin.H{
		"explanation": explanation,
		"path":        path,
	})
}
