package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2CopilotHandler struct {
	copilotService *services.AICopilotService
}

func NewV2CopilotHandler() *V2CopilotHandler {
	return &V2CopilotHandler{
		copilotService: services.NewAICopilotService(),
	}
}

func (h *V2CopilotHandler) QueryCopilot(c *gin.Context) {
	var req services.CopilotQueryRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body format",
		})
		return
	}

	if req.Query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Query string cannot be empty",
		})
		return
	}

	resp, err := h.copilotService.ProcessQuery(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process AI copilot query",
		})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *V2CopilotHandler) GetCopilotPrompts(c *gin.Context) {
	prompts := []map[string]string{
		{
			"id":          "1",
			"label":       "Explain this packet",
			"query":       "Explain this packet in detail",
			"category":    "DPI Telemetry",
			"description": "Analyzes header flags, protocols, and payload length.",
		},
		{
			"id":          "2",
			"label":       "Why is this alert suspicious?",
			"query":       "Why is this alert suspicious?",
			"category":    "Threat Alerts",
			"description": "Cross-references threat scores and anomalous port activity.",
		},
		{
			"id":          "3",
			"label":       "Summarize last 24 hours",
			"query":       "Summarize threats and traffic in the last 24 hours",
			"category":    "SOC Summary",
			"description": "Generates executive high-level threat telemetry overview.",
		},
		{
			"id":          "4",
			"label":       "Map threat to MITRE ATT&CK",
			"query":       "Map this threat to MITRE ATT&CK framework",
			"category":    "MITRE ATT&CK",
			"description": "Correlates active alerts with MITRE tactics & techniques.",
		},
		{
			"id":          "5",
			"label":       "Explain DNS behaviour",
			"query":       "Explain DNS query behaviour and anomalies",
			"category":    "Protocol Inspection",
			"description": "Inspects port 53 query entropy and tunneling patterns.",
		},
		{
			"id":          "6",
			"label":       "Show affected assets",
			"query":       "Show affected assets and host risk scores",
			"category":    "Asset Management",
			"description": "Identifies internal IP addresses involved in active alerts.",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"prompts": prompts,
	})
}
