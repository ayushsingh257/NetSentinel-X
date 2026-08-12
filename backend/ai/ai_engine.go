package ai

import (
	"context"
	"time"

	aimodels "netsentinel-x-backend/models/ai"
	"netsentinel-x-backend/models/events"
)

type AIEngine struct {
	provider        aimodels.LLMProvider
	threatAnalyzer  *ThreatAnalyzer
	alertClassifier *AlertClassifier
	riskEngine      *RiskScoringEngine
	recEngine       *RecommendationEngine
}

func NewAIEngine(provider aimodels.LLMProvider) *AIEngine {
	if provider == nil {
		provider = NewDeterministicMockProvider()
	}
	return &AIEngine{
		provider:        provider,
		threatAnalyzer:  NewThreatAnalyzer(provider),
		alertClassifier: NewAlertClassifier(provider),
		riskEngine:      NewRiskScoringEngine(),
		recEngine:       NewRecommendationEngine(),
	}
}

func (e *AIEngine) AnalyzeEvent(ctx context.Context, evt events.Event) (*aimodels.AIAnalysisResult, error) {
	req := aimodels.ThreatAnalysisRequest{
		EventID:  evt.EventID,
		Severity: evt.Severity,
		Source:   evt.Source,
		Payload:  evt.Payload,
	}

	analysis, err := e.threatAnalyzer.Analyze(ctx, req)
	if err != nil {
		return nil, err
	}

	risk := e.riskEngine.CalculateRiskScore(evt.Severity, 1.2, 3, "SUSPICIOUS")
	playbook := e.recEngine.GeneratePlaybook(analysis.Classification, evt.Severity)

	return &aimodels.AIAnalysisResult{
		ID:                events.GenerateUUID(),
		EventID:           evt.EventID,
		ConfidenceScore:   analysis.Confidence,
		Classification:    analysis.Classification,
		Category:          analysis.Classification,
		RiskScore:         risk,
		FalsePositiveProb: 0.08,
		MITREMapping:      analysis.MITRE,
		Recommendations:   playbook,
		CreatedAt:         time.Now().UTC(),
		ProviderName:      e.provider.Name(),
	}, nil
}

func (e *AIEngine) QueryCopilot(ctx context.Context, prompt string, contextData map[string]interface{}) (*aimodels.CopilotResponse, error) {
	return e.provider.GenerateCopilotResponse(ctx, prompt, contextData)
}
