package handlers

import (
	"net/http"

	"netsentinel-x-backend/services"

	"github.com/gin-gonic/gin"
)

// V2DatabaseSecurityHandler handles Era 23 Database Security REST API endpoints.
type V2DatabaseSecurityHandler struct {
	dbSecurityService  *services.DatabaseSecurityService
	dataEncryptService *services.DataEncryptionService
	dataClassService   *services.DataClassificationService
	dbAuditService     *services.DatabaseAuditService
	sqlSecurityService *services.SQLSecurityService
	backupService      *services.BackupSecurityService
}

// NewV2DatabaseSecurityHandler creates a new V2DatabaseSecurityHandler instance.
func NewV2DatabaseSecurityHandler(
	dbSecurityService *services.DatabaseSecurityService,
	dataEncryptService *services.DataEncryptionService,
	dataClassService *services.DataClassificationService,
	dbAuditService *services.DatabaseAuditService,
	sqlSecurityService *services.SQLSecurityService,
	backupService *services.BackupSecurityService,
) *V2DatabaseSecurityHandler {
	return &V2DatabaseSecurityHandler{
		dbSecurityService:  dbSecurityService,
		dataEncryptService: dataEncryptService,
		dataClassService:   dataClassService,
		dbAuditService:     dbAuditService,
		sqlSecurityService: sqlSecurityService,
		backupService:      backupService,
	}
}

// GetDatabasePosture returns overall database security posture.
// GET /api/v2/database/posture
func (h *V2DatabaseSecurityHandler) GetDatabasePosture(c *gin.Context) {
	posture := h.dbSecurityService.GetPosture()
	backup := h.backupService.GetBackupPosture()

	c.JSON(http.StatusOK, gin.H{
		"posture":      posture,
		"backup_score": backup.Score,
		"era":          "23",
		"layer":        "Database Security & Data Protection",
	})
}

// GetDatabaseConfig returns PostgreSQL security configuration check results.
// GET /api/v2/database/config
func (h *V2DatabaseSecurityHandler) GetDatabaseConfig(c *gin.Context) {
	posture := h.dbSecurityService.GetPosture()
	c.JSON(http.StatusOK, gin.H{
		"version":       posture.PostgreSQLVersion,
		"ssl_enforced":  posture.SSLEnforced,
		"public_access": posture.PublicAccess,
		"checks":        posture.Checks,
	})
}

// GetDatabaseAccess returns least privilege database role definitions.
// GET /api/v2/database/access
func (h *V2DatabaseSecurityHandler) GetDatabaseAccess(c *gin.Context) {
	roles := h.dbSecurityService.GetDatabaseRoles()
	classified := h.dataClassService.GetClassifiedFields()

	c.JSON(http.StatusOK, gin.H{
		"roles":             roles,
		"classified_fields": classified,
	})
}

// GetDatabaseAudit returns query audit execution logs.
// GET /api/v2/database/audit
func (h *V2DatabaseSecurityHandler) GetDatabaseAudit(c *gin.Context) {
	logs := h.dbAuditService.GetAuditLogs()
	c.JSON(http.StatusOK, gin.H{
		"audit_logs": logs,
		"total":      len(logs),
	})
}

// GetDatabaseEncryption returns data-at-rest and in-transit encryption reports.
// GET /api/v2/database/encryption
func (h *V2DatabaseSecurityHandler) GetDatabaseEncryption(c *gin.Context) {
	report := h.dataEncryptService.GetStatusReport()
	c.JSON(http.StatusOK, gin.H{
		"encryption_report": report,
	})
}

// GetDatabaseBackups returns database backup security posture and restore test status.
// GET /api/v2/database/backups
func (h *V2DatabaseSecurityHandler) GetDatabaseBackups(c *gin.Context) {
	backup := h.backupService.GetBackupPosture()
	c.JSON(http.StatusOK, gin.H{
		"backup_posture": backup,
	})
}
