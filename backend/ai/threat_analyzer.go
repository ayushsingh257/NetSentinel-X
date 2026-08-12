package ai

import (
	"context"

	aimodels "netsentinel-x-backend/models/ai"
)

type ThreatAnalyzer struct {
	provider aimodels.LLMProvider
}

func NewThreatAnalyzer(provider aimodels.LLMProvider) *ThreatAnalyzer {
	if provider == nil {
		provider = NewDeterministicMockProvider()
	}
	return &ThreatAnalyzer{provider: provider}
}

func (ta *ThreatAnalyzer) Analyze(ctx context.Context, req aimodels.ThreatAnalysisRequest) (*aimodels.ThreatAnalysisResponse, error) {
	return ta.provider.AnalyzeThreat(ctx, req)
}
