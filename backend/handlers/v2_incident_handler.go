package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2IncidentHandler struct {
	incidentService *services.IncidentService
}

func NewV2IncidentHandler() *V2IncidentHandler {
	return &V2IncidentHandler{
		incidentService: services.NewIncidentService(),
	}
}

type CreateIncidentReq struct {
	Title          string   `json:"title"`
	Summary        string   `json:"summary"`
	Severity       string   `json:"severity"`
	Priority       string   `json:"priority"`
	Analyst        string   `json:"analyst"`
	AffectedAssets []string `json:"affected_assets"`
}

type AddEvidenceReq struct {
	Source        string `json:"source"`
	Type          string `json:"type"`
	Title         string `json:"title"`
	Content       string `json:"content"`
	RelatedEntity string `json:"related_entity"`
}

type AssignReq struct {
	Analyst string `json:"analyst"`
	Role    string `json:"role"`
}

type CloseReq struct {
	ResolutionNotes string `json:"resolution_notes"`
}

func (h *V2IncidentHandler) GetOverview(c *gin.Context) {
	overview := h.incidentService.GetOverview()
	c.JSON(http.StatusOK, overview)
}

func (h *V2IncidentHandler) GetIncidents(c *gin.Context) {
	incidents := h.incidentService.GetIncidents()
	c.JSON(http.StatusOK, gin.H{
		"incidents": incidents,
		"total":     len(incidents),
	})
}

func (h *V2IncidentHandler) GetIncidentByID(c *gin.Context) {
	id := c.Param("id")
	inc, exists := h.incidentService.GetIncidentByID(id)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "incident not found",
		})
		return
	}
	c.JSON(http.StatusOK, inc)
}

func (h *V2IncidentHandler) CreateIncident(c *gin.Context) {
	var req CreateIncidentReq
	if err := c.ShouldBindJSON(&req); err != nil || req.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "title parameter is required",
		})
		return
	}

	if req.Severity == "" {
		req.Severity = "HIGH"
	}
	if req.Priority == "" {
		req.Priority = "P2"
	}
	if req.Analyst == "" {
		req.Analyst = "Unassigned"
	}

	inc := h.incidentService.CreateIncident(req.Title, req.Summary, req.Severity, req.Priority, req.Analyst, req.AffectedAssets)
	c.JSON(http.StatusCreated, inc)
}

func (h *V2IncidentHandler) AddEvidence(c *gin.Context) {
	id := c.Param("id")
	var req AddEvidenceReq
	if err := c.ShouldBindJSON(&req); err != nil || req.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "title and source parameters are required",
		})
		return
	}

	ev, ok := h.incidentService.AddEvidence(id, req.Source, req.Type, req.Title, req.Content, req.RelatedEntity)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "incident not found",
		})
		return
	}

	c.JSON(http.StatusCreated, ev)
}

func (h *V2IncidentHandler) AssignAnalyst(c *gin.Context) {
	id := c.Param("id")
	var req AssignReq
	if err := c.ShouldBindJSON(&req); err != nil || req.Analyst == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "analyst parameter is required",
		})
		return
	}

	if req.Role == "" {
		req.Role = "Analyst"
	}

	ok := h.incidentService.AssignAnalyst(id, req.Analyst, req.Role)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "incident not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "analyst assigned successfully",
	})
}

func (h *V2IncidentHandler) CloseIncident(c *gin.Context) {
	id := c.Param("id")
	var req CloseReq
	if err := c.ShouldBindJSON(&req); err != nil || req.ResolutionNotes == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "resolution_notes parameter is required",
		})
		return
	}

	ok := h.incidentService.CloseIncident(id, req.ResolutionNotes)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "incident not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "incident closed successfully",
	})
}
