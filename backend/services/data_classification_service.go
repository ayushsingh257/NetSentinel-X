package services

import (
	"strings"

	"netsentinel-x-backend/models"
)

// ClassifiedField represents a classified database field definition.
type ClassifiedField struct {
	Table       string                         `json:"table"`
	Column      string                         `json:"column"`
	Level       models.DataClassificationLevel `json:"level"`
	Masked      bool                           `json:"masked"`
	Encrypted   bool                           `json:"encrypted"`
	Description string                         `json:"description"`
}

// DataClassificationService categorizes and masks database fields based on security policy.
type DataClassificationService struct {
	schema []ClassifiedField
}

// NewDataClassificationService creates a new DataClassificationService with default schema mapping.
func NewDataClassificationService() *DataClassificationService {
	s := &DataClassificationService{}
	s.seedSchema()
	return s
}

func (s *DataClassificationService) seedSchema() {
	s.schema = []ClassifiedField{
		{Table: "users", Column: "username", Level: models.ClassificationPublic, Masked: false, Encrypted: false, Description: "Public analyst handle"},
		{Table: "users", Column: "email", Level: models.ClassificationConfidential, Masked: true, Encrypted: false, Description: "Analyst email address"},
		{Table: "users", Column: "password_hash", Level: models.ClassificationRestricted, Masked: true, Encrypted: true, Description: "Bcrypt password hash"},
		{Table: "api_keys", Column: "key_hash", Level: models.ClassificationRestricted, Masked: true, Encrypted: true, Description: "SHA-256 API Key hash"},
		{Table: "api_keys", Column: "prefix", Level: models.ClassificationInternal, Masked: false, Encrypted: false, Description: "Masked key prefix for identification"},
		{Table: "incidents", Column: "title", Level: models.ClassificationInternal, Masked: false, Encrypted: false, Description: "Incident threat title"},
		{Table: "incidents", Column: "attacker_ip", Level: models.ClassificationConfidential, Masked: true, Encrypted: false, Description: "Source IP of threat actor"},
		{Table: "audit_logs", Column: "ip_address", Level: models.ClassificationConfidential, Masked: true, Encrypted: false, Description: "Client request IP address"},
		{Table: "webhook_subscriptions", Column: "secret", Level: models.ClassificationRestricted, Masked: true, Encrypted: true, Description: "HMAC webhook signing key"},
	}
}

// GetClassifiedFields returns all classified fields.
func (s *DataClassificationService) GetClassifiedFields() []ClassifiedField {
	return s.schema
}

// MaskValue applies appropriate masking based on data classification level.
func (s *DataClassificationService) MaskValue(level models.DataClassificationLevel, rawVal string) string {
	switch level {
	case models.ClassificationRestricted:
		return "********"
	case models.ClassificationConfidential:
		if strings.Contains(rawVal, "@") {
			parts := strings.Split(rawVal, "@")
			if len(parts[0]) > 2 {
				return parts[0][:2] + "****@" + parts[1]
			}
			return "*@*"
		}
		if len(rawVal) > 6 {
			return rawVal[:3] + "..." + rawVal[len(rawVal)-3:]
		}
		return "***.***.***"
	default:
		return rawVal
	}
}
