package ai

import (
	"context"

	aimodels "netsentinel-x-backend/models/ai"
)

type AlertClassifier struct {
	provider aimodels.LLMProvider
}

func NewAlertClassifier(provider aimodels.LLMProvider) *AlertClassifier {
	if provider == nil {
		provider = NewDeterministicMockProvider()
	}
	return &AlertClassifier{provider: provider}
}

func (ac *AlertClassifier) Classify(ctx context.Context, req aimodels.AlertClassifyRequest) (*aimodels.AlertClassifyResponse, error) {
	return ac.provider.ClassifyAlert(ctx, req)
}
