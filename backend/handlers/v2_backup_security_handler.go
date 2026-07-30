package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"netsentinel-x-backend/services"
)

// V2BackupSecurityHandler exposes REST endpoints for Era 28 Enterprise Backup & Disaster Recovery.
type V2BackupSecurityHandler struct {
	backupService  *services.BackupService
	restoreService *services.RestoreVerificationService
}

// NewV2BackupSecurityHandler initializes V2BackupSecurityHandler with backup and restore services.
func NewV2BackupSecurityHandler(bs *services.BackupService, rs *services.RestoreVerificationService) *V2BackupSecurityHandler {
	return &V2BackupSecurityHandler{
		backupService:  bs,
		restoreService: rs,
	}
}

// GetBackupStatus handles GET /api/v2/backup/status
func (h *V2BackupSecurityHandler) GetBackupStatus(c *gin.Context) {
	status := h.backupService.GetStatus()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    status,
	})
}

// GetBackupHistory handles GET /api/v2/backup/history
func (h *V2BackupSecurityHandler) GetBackupHistory(c *gin.Context) {
	history := h.backupService.GetHistory()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    history,
		"count":   len(history),
	})
}

// GetBackupIntegrity handles GET /api/v2/backup/integrity
func (h *V2BackupSecurityHandler) GetBackupIntegrity(c *gin.Context) {
	integrity := h.restoreService.GetIntegrityOverview()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    integrity,
	})
}

// GetRecoveryReadiness handles GET /api/v2/backup/recovery-readiness
func (h *V2BackupSecurityHandler) GetRecoveryReadiness(c *gin.Context) {
	readiness := h.restoreService.GetRecoveryReadiness()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    readiness,
	})
}

// ExecuteRestoreTest handles POST /api/v2/backup/restore-test
func (h *V2BackupSecurityHandler) ExecuteRestoreTest(c *gin.Context) {
	backupID := c.DefaultQuery("backup_id", "BKP-2026-001")
	rawData := []byte("netsentinel-production-db-full-snapshot-dump-v2.28")

	res, err := h.restoreService.SimulateRestore(backupID, rawData, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
			"data":    res,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Restore simulation completed successfully",
		"data":    res,
	})
}
