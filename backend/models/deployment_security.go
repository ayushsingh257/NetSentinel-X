package models

import "time"

// ReadinessCheckStatus represents status of a production deployment security check.
type ReadinessCheckStatus string

const (
	CheckPass ReadinessCheckStatus = "PASS"
	CheckFail ReadinessCheckStatus = "FAIL"
	CheckWarn ReadinessCheckStatus = "WARN"
)

// ProductionReadinessCheck represents an individual security deployment check item.
type ProductionReadinessCheck struct {
	ID             string               `json:"id"`
	Category       string               `json:"category"` // "Environment", "Transport", "BrowserCookie", "Container", "Database"
	CheckName      string               `json:"check_name"`
	Status         ReadinessCheckStatus `json:"status"`
	Details        string               `json:"details"`
	Recommendation string               `json:"recommendation"`
}

// TLSSecurityPosture summarizes transport layer security configuration.
type TLSSecurityPosture struct {
	HTTPSEnabled     bool   `json:"https_enabled"`
	RedirectHTTP     bool   `json:"redirect_http"`
	TLSVersion       string `json:"tls_version"`
	CertificateValid bool   `json:"certificate_valid"`
	HSTSEnabled      bool   `json:"hsts_enabled"`
	SecureCookies    bool   `json:"secure_cookies"`
}

// DeploymentServiceHealth represents operational health status of an infrastructure component.
type DeploymentServiceHealth struct {
	ServiceName string    `json:"service_name"`
	Status      string    `json:"status"` // "Healthy", "Degraded", "Unhealthy"
	LatencyMs   int64     `json:"latency_ms"`
	Details     string    `json:"details"`
	LastChecked time.Time `json:"last_checked"`
}

// ProductionDeploymentPosture represents overall production deployment security readiness.
type ProductionDeploymentPosture struct {
	Score               int       `json:"score"`
	DeploymentReadiness string    `json:"deployment_readiness"` // "PRODUCTION_READY" or "DEPLOYMENT_BLOCKED"
	PassedChecksCount   int       `json:"passed_checks_count"`
	FailedChecksCount   int       `json:"failed_checks_count"`
	Environment         string    `json:"environment"`
	DebugMode           bool      `json:"debug_mode"`
	RollbackReadiness   string    `json:"rollback_readiness"` // "READY" or "NOT_READY"
	LastEvaluation      time.Time `json:"last_evaluation"`
}
