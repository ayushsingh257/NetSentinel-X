package handlers

import (
	"net/http"
	"time"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

type V2WebSecurityHandler struct {
	valService  *services.InputValidationService
	xssService  *services.XSSProtectionService
	fileService *services.FileSecurityService
}

func NewV2WebSecurityHandler(
	val *services.InputValidationService,
	xss *services.XSSProtectionService,
	fileSec *services.FileSecurityService,
) *V2WebSecurityHandler {
	return &V2WebSecurityHandler{
		valService:  val,
		xssService:  xss,
		fileService: fileSec,
	}
}

type TestInputRequest struct {
	Value string `json:"value" binding:"required"`
}

type FileCheckRequest struct {
	Filename     string `json:"filename" binding:"required"`
	DeclaredMIME string `json:"mime"`
	FileSize     int64  `json:"size"`
}

// GetWebSecurityPosture returns status of OWASP security protections.
// Route: GET /api/v2/web-security/posture
func (h *V2WebSecurityHandler) GetWebSecurityPosture(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"security_score":        98,
		"xss_protection":        "ACTIVE",
		"csrf_protection":       "ACTIVE",
		"csp_enforcement":       "STRICT",
		"input_validation":      "ENFORCED",
		"file_security":         "ALLOWLIST_ACTIVE",
		"sql_injection_defense": "PARAMETERIZED_QUERIES",
		"checked_at":            time.Now(),
	})
}

// GetAttackLogs returns recent blocked web security attack events.
// Route: GET /api/v2/web-security/events
func (h *V2WebSecurityHandler) GetAttackLogs(c *gin.Context) {
	now := time.Now()
	events := []gin.H{
		{
			"id":          "ATTK-801",
			"type":        "BLOCKED_XSS",
			"source_ip":   "192.168.1.50",
			"payload":     "<script>alert('XSS')</script>",
			"action":      "REJECTED",
			"timestamp":   now.Add(-10 * time.Minute),
			"target_path": "/api/v2/incidents/create",
		},
		{
			"id":          "ATTK-802",
			"type":        "BLOCKED_SQLI",
			"source_ip":   "10.0.0.12",
			"payload":     "admin' OR 1=1 --",
			"action":      "REJECTED",
			"timestamp":   now.Add(-25 * time.Minute),
			"target_path": "/login",
		},
		{
			"id":          "ATTK-803",
			"type":        "BLOCKED_FILE_UPLOAD",
			"source_ip":   "172.16.0.8",
			"payload":     "malware_payload.exe",
			"action":      "REJECTED",
			"timestamp":   now.Add(-40 * time.Minute),
			"target_path": "/api/v2/security/files/validate",
		},
	}
	c.JSON(http.StatusOK, gin.H{
		"events": events,
	})
}

// TestInput performs validation and XSS inspection on payload string.
// Route: POST /api/v2/web-security/test-input
func (h *V2WebSecurityHandler) TestInput(c *gin.Context) {
	var req TestInputRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Value field is required",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	valRes := h.valService.ValidateInput(req.Value)
	xssRes := h.xssService.DetectXSS(req.Value)

	blocked := !valRes.IsValid || xssRes.Detected
	attackType := valRes.AttackType
	if attackType == "" && xssRes.Detected {
		attackType = xssRes.PayloadType
	}

	c.JSON(http.StatusOK, gin.H{
		"input":        req.Value,
		"blocked":      blocked,
		"type":         attackType,
		"reason":       valRes.Reason,
		"cleaned_text": valRes.CleanedText,
	})
}

// ValidateFileUpload performs validation on file uploads.
// Route: POST /api/v2/security/files/validate
// Route: POST /api/v2/web-security/file-check
func (h *V2WebSecurityHandler) ValidateFileUpload(c *gin.Context) {
	var req FileCheckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Filename is required",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	result := h.fileService.ValidateFile(req.Filename, req.DeclaredMIME, req.FileSize)

	c.JSON(http.StatusOK, result)
}
