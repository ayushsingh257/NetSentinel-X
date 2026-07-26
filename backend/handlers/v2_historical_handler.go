package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2HistoricalHandler struct {
	histService *services.HistoricalInvestigationService
}

func NewV2HistoricalHandler() *V2HistoricalHandler {
	return &V2HistoricalHandler{
		histService: services.NewHistoricalInvestigationService(),
	}
}

type ThreatHuntQueryReq struct {
	Query string `json:"query"`
}

func (h *V2HistoricalHandler) SearchEvents(c *gin.Context) {
	q := c.Query("q")
	events := h.histService.SearchEvents(q)
	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"total":  len(events),
		"query":  q,
	})
}

func (h *V2HistoricalHandler) GetEvents(c *gin.Context) {
	events := h.histService.GetAllEvents()
	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"total":  len(events),
	})
}

func (h *V2HistoricalHandler) GetIOCHistory(c *gin.Context) {
	ioc := c.Param("value")
	history, exists := h.histService.GetIOCHistory(ioc)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "IOC history not found",
			"ioc":   ioc,
		})
		return
	}
	c.JSON(http.StatusOK, history)
}

func (h *V2HistoricalHandler) GetReplayByID(c *gin.Context) {
	id := c.Param("id")
	steps := h.histService.GetReplaySequence(id)
	c.JSON(http.StatusOK, gin.H{
		"incident_id": id,
		"steps":       steps,
		"total_steps": len(steps),
	})
}

func (h *V2HistoricalHandler) RunHuntQuery(c *gin.Context) {
	var req ThreatHuntQueryReq
	if err := c.ShouldBindJSON(&req); err != nil || req.Query == "" {
		req.Query = "suspicious dns"
	}

	result := h.histService.RunThreatHuntQuery(req.Query)
	c.JSON(http.StatusOK, result)
}

func (h *V2HistoricalHandler) GetHuntHypothesis(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		q = "active threat"
	}
	result := h.histService.RunThreatHuntQuery(q)
	c.JSON(http.StatusOK, gin.H{
		"hypothesis":          result.Hypothesis,
		"confidence_score":    result.ConfidenceScore,
		"investigation_steps": result.InvestigationSteps,
		"risk_explanation":    result.RiskExplanation,
	})
}
