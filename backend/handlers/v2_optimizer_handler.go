package handlers

import (
	"net/http"

	"netsentinel-x-backend/models"
	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2OptimizerHandler struct {
	optimizerService *services.DetectionOptimizerService
}

func NewV2OptimizerHandler() *V2OptimizerHandler {
	return &V2OptimizerHandler{
		optimizerService: services.NewDetectionOptimizerService(),
	}
}

type AnalyzeReq struct {
	RuleID string `json:"rule_id"`
}

func (h *V2OptimizerHandler) GetOverview(c *gin.Context) {
	overview := h.optimizerService.GetOverview()
	c.JSON(http.StatusOK, overview)
}

func (h *V2OptimizerHandler) GetRules(c *gin.Context) {
	perfs := h.optimizerService.GetRulePerformances()
	c.JSON(http.StatusOK, gin.H{
		"performances": perfs,
		"total":        len(perfs),
	})
}

func (h *V2OptimizerHandler) GetRecommendations(c *gin.Context) {
	recs := h.optimizerService.GetRecommendations()
	c.JSON(http.StatusOK, gin.H{
		"recommendations": recs,
		"total":           len(recs),
	})
}

func (h *V2OptimizerHandler) GetGaps(c *gin.Context) {
	gaps := h.optimizerService.GetDetectionGaps()
	c.JSON(http.StatusOK, gin.H{
		"gaps":  gaps,
		"total": len(gaps),
	})
}

func (h *V2OptimizerHandler) SubmitFeedback(c *gin.Context) {
	var fb models.FeedbackRecord
	if err := c.ShouldBindJSON(&fb); err != nil || fb.RuleID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "rule_id and verdict parameters are required",
		})
		return
	}

	recorded := h.optimizerService.RecordFeedback(fb)
	c.JSON(http.StatusCreated, recorded)
}

func (h *V2OptimizerHandler) AnalyzeRule(c *gin.Context) {
	var req AnalyzeReq
	if err := c.ShouldBindJSON(&req); err != nil || req.RuleID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "rule_id parameter is required",
		})
		return
	}

	perf, recs := h.optimizerService.AnalyzeRule(req.RuleID)
	c.JSON(http.StatusOK, gin.H{
		"performance":     perf,
		"recommendations": recs,
	})
}
