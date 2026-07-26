package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2MITREHandler struct {
	mitreService *services.MITREService
}

func NewV2MITREHandler() *V2MITREHandler {
	return &V2MITREHandler{
		mitreService: services.NewMITREService(),
	}
}

type ExplainTechniqueReq struct {
	TechniqueID string `json:"technique_id"`
}

func (h *V2MITREHandler) GetMatrix(c *gin.Context) {
	matrix := h.mitreService.GetMatrix()
	c.JSON(http.StatusOK, gin.H{
		"matrix":        matrix,
		"total_tactics": len(matrix),
	})
}

func (h *V2MITREHandler) GetTechniques(c *gin.Context) {
	query := c.Query("q")
	if query != "" {
		results := h.mitreService.SearchTechniques(query)
		c.JSON(http.StatusOK, gin.H{
			"techniques": results,
			"total":      len(results),
		})
		return
	}

	matrix := h.mitreService.GetMatrix()
	var allTechs []interface{}
	for _, grp := range matrix {
		for _, tech := range grp.Techniques {
			allTechs = append(allTechs, tech)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"techniques": allTechs,
		"total":      len(allTechs),
	})
}

func (h *V2MITREHandler) GetTechniqueByID(c *gin.Context) {
	id := c.Param("id")
	tech, exists := h.mitreService.GetTechniqueByID(id)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "MITRE technique not found",
		})
		return
	}

	c.JSON(http.StatusOK, tech)
}

func (h *V2MITREHandler) GetStatistics(c *gin.Context) {
	stats := h.mitreService.GetStatistics()
	c.JSON(http.StatusOK, stats)
}

func (h *V2MITREHandler) GetHeatMap(c *gin.Context) {
	heatmap := h.mitreService.GetHeatMap()
	c.JSON(http.StatusOK, heatmap)
}

func (h *V2MITREHandler) ExplainTechnique(c *gin.Context) {
	var req ExplainTechniqueReq
	if err := c.ShouldBindJSON(&req); err != nil || req.TechniqueID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "technique_id is required",
		})
		return
	}

	explanation, mitigation, exists := h.mitreService.ExplainTechnique(req.TechniqueID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Technique not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"technique_id": req.TechniqueID,
		"explanation":  explanation,
		"mitigation":   mitigation,
	})
}
