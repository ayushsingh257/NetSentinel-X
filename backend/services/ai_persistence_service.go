package services

import (
	"sync"

	aimodels "netsentinel-x-backend/models/ai"
)

type AIPersistenceService struct {
	mu      sync.RWMutex
	results []aimodels.AIAnalysisResult
	maxSize int
}

var (
	globalAIPersistence *AIPersistenceService
	aiPersistenceOnce   sync.Once
)

func GetAIPersistenceService() *AIPersistenceService {
	aiPersistenceOnce.Do(func() {
		globalAIPersistence = &AIPersistenceService{
			results: make([]aimodels.AIAnalysisResult, 0, 500),
			maxSize: 500,
		}
	})
	return globalAIPersistence
}

func (s *AIPersistenceService) SaveAnalysisResult(res aimodels.AIAnalysisResult) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if len(s.results) >= s.maxSize {
		s.results = s.results[1:]
	}
	s.results = append(s.results, res)
}

func (s *AIPersistenceService) GetLatestAnalysisResults(limit int) []aimodels.AIAnalysisResult {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if limit <= 0 || limit > len(s.results) {
		limit = len(s.results)
	}

	result := make([]aimodels.AIAnalysisResult, limit)
	copy(result, s.results[len(s.results)-limit:])
	return result
}
