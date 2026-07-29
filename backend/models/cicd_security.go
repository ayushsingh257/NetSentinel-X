package models

import "time"

// SASTFinding represents a Static Application Security Testing code finding.
type SASTFinding struct {
	ID          string        `json:"id"`
	RuleID      string        `json:"rule_id"`
	File        string        `json:"file"`
	Line        int           `json:"line"`
	Severity    EventSeverity `json:"severity"`
	Description string        `json:"description"`
	Snippet     string        `json:"snippet"`
}

// SecretScanFinding represents an exposed credential or private key detected in git history.
type SecretScanFinding struct {
	ID         string        `json:"id"`
	SecretType string        `json:"secret_type"`
	File       string        `json:"file"`
	Line       int           `json:"line"`
	Severity   EventSeverity `json:"severity"`
	Status     string        `json:"status"` // "BLOCKED" or "REMEDIATED"
}

// DependencyFinding represents a CVE vulnerability in third-party packages.
type DependencyFinding struct {
	ID               string        `json:"id"`
	PackageName      string        `json:"package_name"`
	InstalledVersion string        `json:"installed_version"`
	FixedVersion     string        `json:"fixed_version"`
	CVE              string        `json:"cve"`
	Severity         EventSeverity `json:"severity"`
	Description      string        `json:"description"`
}

// ContainerFinding represents an OS or package vulnerability in Docker base images.
type ContainerFinding struct {
	ID              string        `json:"id"`
	ImageName       string        `json:"image_name"`
	Scanner         string        `json:"scanner"`
	PackageName     string        `json:"package_name"`
	VulnerabilityID string        `json:"vulnerability_id"`
	Severity        EventSeverity `json:"severity"`
	Description     string        `json:"description"`
	FixedVersion    string        `json:"fixed_version"`
}

// SBOMComponent represents a single Software Bill of Materials component inventory record.
type SBOMComponent struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	License     string `json:"license"`
	Hash        string `json:"hash"`
	PackageType string `json:"package_type"` // "go-module", "npm-package", "container-layer"
}

// CICDPipelinePosture summarizes overall SSDLC security pipeline health and gate status.
type CICDPipelinePosture struct {
	SecurityScore        int       `json:"security_score"`
	LastPipelineRun      time.Time `json:"last_pipeline_run"`
	SASTStatus           string    `json:"sast_status"`            // "PASSED" or "FAILED"
	SecretScanStatus     string    `json:"secret_scan_status"`     // "PASSED" or "FAILED"
	DependencyScanStatus string    `json:"dependency_scan_status"` // "PASSED" or "FAILED"
	ContainerScanStatus  string    `json:"container_scan_status"`  // "PASSED" or "FAILED"
	SBOMStatus           string    `json:"sbom_status"`            // "CREATED" or "MISSING"
	TotalFindingsCount   int       `json:"total_findings_count"`
	GateOutcome          string    `json:"gate_outcome"` // "DEPLOYMENT_ALLOWED" or "DEPLOYMENT_BLOCKED"
}
