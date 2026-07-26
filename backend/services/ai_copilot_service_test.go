package services

import (
	"strings"
	"testing"
)

func TestAICopilotService_ProcessQuery(t *testing.T) {
	service := NewAICopilotService()

	tests := []struct {
		name                 string
		query                string
		expectedMITRE        string
		expectedMinReasoning int
	}{
		{
			name:                 "Packet Query Handling",
			query:                "Explain this packet",
			expectedMITRE:        "T1071",
			expectedMinReasoning: 2,
		},
		{
			name:                 "Alert Query Handling",
			query:                "Why is this alert suspicious?",
			expectedMITRE:        "T1110",
			expectedMinReasoning: 2,
		},
		{
			name:                 "DNS Query Handling",
			query:                "Explain DNS behaviour and queries",
			expectedMITRE:        "T1071.004",
			expectedMinReasoning: 2,
		},
		{
			name:                 "TLS Query Handling",
			query:                "Explain TLS traffic and certificates",
			expectedMITRE:        "T1573",
			expectedMinReasoning: 2,
		},
		{
			name:                 "MITRE Mapping Query",
			query:                "Map this threat to MITRE ATT&CK",
			expectedMITRE:        "T1048.003",
			expectedMinReasoning: 2,
		},
		{
			name:                 "Summary Query Handling",
			query:                "Summarize recent threats in the last 24 hours",
			expectedMITRE:        "T1078",
			expectedMinReasoning: 2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := CopilotQueryRequest{
				Query: tt.query,
			}

			resp, err := service.ProcessQuery(req)
			if err != nil {
				t.Fatalf("Unexpected error from ProcessQuery: %v", err)
			}

			if resp == nil {
				t.Fatal("Expected non-nil CopilotQueryResponse")
			}

			if resp.Query != tt.query {
				t.Errorf("Expected response query %q, got %q", tt.query, resp.Query)
			}

			if len(resp.Reasoning) < tt.expectedMinReasoning {
				t.Errorf("Expected at least %d reasoning items, got %d", tt.expectedMinReasoning, len(resp.Reasoning))
			}

			if !strings.Contains(resp.MITRETechnique, tt.expectedMITRE) {
				t.Errorf("Expected MITRE technique to contain %q, got %q", tt.expectedMITRE, resp.MITRETechnique)
			}

			if len(resp.Evidence) == 0 {
				t.Error("Expected at least 1 evidence item, got 0")
			}

			if resp.ConfidenceScore <= 0 {
				t.Errorf("Expected confidence score > 0, got %f", resp.ConfidenceScore)
			}

			if len(resp.RecommendedActions) == 0 {
				t.Error("Expected at least 1 recommended action")
			}
		})
	}
}
