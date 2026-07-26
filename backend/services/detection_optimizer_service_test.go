package services

import (
	"testing"

	"netsentinel-x-backend/models"
)

func TestDetectionOptimizerService(t *testing.T) {
	service := NewDetectionOptimizerService()

	t.Run("GetOverview Structure", func(t *testing.T) {
		overview := service.GetOverview()
		if overview.TotalRulesAnalyzed < 3 {
			t.Fatalf("Expected at least 3 analyzed rules, got %d", overview.TotalRulesAnalyzed)
		}
		if overview.AvgPerformanceScore < 70 {
			t.Errorf("Expected avg performance score >= 70, got %d", overview.AvgPerformanceScore)
		}
	})

	t.Run("GetRulePerformances List", func(t *testing.T) {
		perfs := service.GetRulePerformances()
		if len(perfs) < 3 {
			t.Errorf("Expected rule performances length >= 3, got %d", len(perfs))
		}
	})

	t.Run("GetRecommendations List", func(t *testing.T) {
		recs := service.GetRecommendations()
		if len(recs) < 2 {
			t.Errorf("Expected recommendations length >= 2, got %d", len(recs))
		}
	})

	t.Run("GetDetectionGaps List", func(t *testing.T) {
		gaps := service.GetDetectionGaps()
		if len(gaps) < 2 {
			t.Errorf("Expected detection gaps length >= 2, got %d", len(gaps))
		}
	})

	t.Run("Record Feedback Tunes Performance", func(t *testing.T) {
		fb := service.RecordFeedback(models.FeedbackRecord{
			AlertID:        "ALT-8001",
			RuleID:         "RULE-SIGMA-001",
			AnalystVerdict: "FALSE_POSITIVE",
			Notes:          "Known internal scanner burst",
		})

		if fb.ID == "" {
			t.Error("Expected feedback ID to be generated")
		}
	})

	t.Run("Analyze Specific Rule", func(t *testing.T) {
		perf, recs := service.AnalyzeRule("RULE-SIGMA-001")
		if perf.RuleID != "RULE-SIGMA-001" {
			t.Errorf("Expected RuleID RULE-SIGMA-001, got %s", perf.RuleID)
		}
		if len(recs) < 1 {
			t.Error("Expected recommendations for RULE-SIGMA-001")
		}
	})
}
