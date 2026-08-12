package ai

import (
	"math"
	"strings"
)

type RiskScoringEngine struct{}

func NewRiskScoringEngine() *RiskScoringEngine {
	return &RiskScoringEngine{}
}

// CalculateRiskScore computes a multi-factor dynamic risk score from 0.0 to 100.0.
func (r *RiskScoringEngine) CalculateRiskScore(severity string, assetCriticality float64, attackFrequency int, iocReputation string) float64 {
	var baseScore float64 = 30.0

	switch strings.ToLower(severity) {
	case "critical":
		baseScore = 90.0
	case "high":
		baseScore = 75.0
	case "medium":
		baseScore = 50.0
	case "low":
		baseScore = 25.0
	}

	if assetCriticality <= 0 {
		assetCriticality = 1.0
	}

	freqBonus := math.Min(float64(attackFrequency)*2.5, 15.0)

	var iocMultiplier float64 = 1.0
	if iocReputation == "MALICIOUS" {
		iocMultiplier = 1.25
	} else if iocReputation == "SUSPICIOUS" {
		iocMultiplier = 1.10
	}

	finalScore := (baseScore * assetCriticality * iocMultiplier) + freqBonus
	return math.Min(math.Max(finalScore, 0.0), 100.0)
}
