package services

import (
	"regexp"
	"strings"
)

// SQLSecurityCheckResult contains SQL injection analysis output.
type SQLSecurityCheckResult struct {
	Safe        bool   `json:"safe"`
	Code        string `json:"code"` // "PARAMETRIZED_SAFE", "SQL_INJECTION_RISK"
	Reason      string `json:"reason"`
	QuerySample string `json:"query_sample"`
}

// SQLSecurityService analyzes SQL queries for injection risks and pattern safety.
type SQLSecurityService struct {
	injectionPatterns []*regexp.Regexp
}

// NewSQLSecurityService creates a new SQLSecurityService instance.
func NewSQLSecurityService() *SQLSecurityService {
	return &SQLSecurityService{
		injectionPatterns: []*regexp.Regexp{
			regexp.MustCompile(`(?i)'\s*\+\s*`),                          // String concatenation: ' + input
			regexp.MustCompile(`(?i)"\s*\+\s*`),                          // String concatenation: " + input
			regexp.MustCompile(`(?i)WHERE\s+[a-z0-9_]+\s*=\s*'\s*\+`),    // WHERE id=' + input
			regexp.MustCompile(`(?i)UNION\s+ALL\s+SELECT`),               // UNION ALL SELECT payload
			regexp.MustCompile(`(?i);\s*DROP\s+TABLE`),                   // Stacked query drop
			regexp.MustCompile(`(?i)OR\s+['"]?1['"]?\s*=\s*['"]?1['"]?`), // OR 1=1 bypass
		},
	}
}

// InspectQuery inspects a SQL query string for injection risk.
func (s *SQLSecurityService) InspectQuery(query string) *SQLSecurityCheckResult {
	trimmed := strings.TrimSpace(query)

	for _, re := range s.injectionPatterns {
		if re.MatchString(trimmed) {
			return &SQLSecurityCheckResult{
				Safe:        false,
				Code:        "SQL_INJECTION_RISK",
				Reason:      "Unsafe string concatenation or dangerous SQL injection pattern detected.",
				QuerySample: trimmed,
			}
		}
	}

	// Check if parameterized ($1, ?, ORM pattern)
	if strings.Contains(trimmed, "$1") || strings.Contains(trimmed, "?") || strings.HasPrefix(trimmed, "db.Where(") {
		return &SQLSecurityCheckResult{
			Safe:        true,
			Code:        "PARAMETRIZED_SAFE",
			Reason:      "Query uses safe parameterized statements or ORM binding.",
			QuerySample: trimmed,
		}
	}

	return &SQLSecurityCheckResult{
		Safe:        true,
		Code:        "PARAMETRIZED_SAFE",
		Reason:      "Static or safe parameter binding.",
		QuerySample: trimmed,
	}
}
