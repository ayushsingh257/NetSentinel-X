package services

import (
	"sync"
	"time"
)

type ClientSecurityProfile struct {
	IP                 string
	BaseLimit          int
	CurrentLimit       int
	FailedAuthCount    int
	ForbiddenCount     int
	ScanCount          int
	IsBlocked          bool
	BlockedUntil       time.Time
	RequestsThisWindow []time.Time
}

type AdaptiveRateService struct {
	mu          sync.RWMutex
	profiles    map[string]*ClientSecurityProfile
	window      time.Duration
	auditLogger *AuditService
}

func NewAdaptiveRateService(audit *AuditService) *AdaptiveRateService {
	s := &AdaptiveRateService{
		profiles:    make(map[string]*ClientSecurityProfile),
		window:      time.Minute,
		auditLogger: audit,
	}

	// Periodic cleanup
	go func() {
		for {
			time.Sleep(s.window)
			s.mu.Lock()
			now := time.Now()
			for ip, prof := range s.profiles {
				var valid []time.Time
				for _, t := range prof.RequestsThisWindow {
					if now.Sub(t) <= s.window {
						valid = append(valid, t)
					}
				}
				prof.RequestsThisWindow = valid

				// Reset temporary penalties if clean window
				if len(valid) == 0 && !prof.IsBlocked {
					prof.CurrentLimit = prof.BaseLimit
					prof.FailedAuthCount = 0
					prof.ForbiddenCount = 0
				}

				if len(valid) == 0 && prof.IsBlocked && now.After(prof.BlockedUntil) {
					prof.IsBlocked = false
					prof.CurrentLimit = prof.BaseLimit
				}

				if len(valid) == 0 && !prof.IsBlocked {
					delete(s.profiles, ip)
				}
			}
			s.mu.Unlock()
		}
	}()

	return s
}

// RecordSignal penalties an IP based on security event signals (401, 403, scan).
func (s *AdaptiveRateService) RecordSignal(ip, signalType string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	prof, exists := s.profiles[ip]
	if !exists {
		prof = &ClientSecurityProfile{
			IP:           ip,
			BaseLimit:    100,
			CurrentLimit: 100,
		}
		s.profiles[ip] = prof
	}

	switch signalType {
	case "AUTH_FAILURE_401":
		prof.FailedAuthCount++
		if prof.FailedAuthCount >= 5 {
			prof.CurrentLimit = 20 // Reduce limit to suspicious tier
		}
		if prof.FailedAuthCount >= 20 {
			prof.IsBlocked = true
			prof.CurrentLimit = 0
			prof.BlockedUntil = time.Now().Add(15 * time.Minute)
		}
	case "FORBIDDEN_403":
		prof.ForbiddenCount++
		if prof.ForbiddenCount >= 3 {
			prof.CurrentLimit = 20
		}
	case "ENDPOINT_SCAN":
		prof.ScanCount++
		prof.CurrentLimit = 10
		if prof.ScanCount >= 10 {
			prof.IsBlocked = true
			prof.CurrentLimit = 0
			prof.BlockedUntil = time.Now().Add(30 * time.Minute)
		}
	}
}

// Allow checks if the client IP is permitted under adaptive rate limits.
func (s *AdaptiveRateService) Allow(ip string) (bool, int, int) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	prof, exists := s.profiles[ip]
	if !exists {
		prof = &ClientSecurityProfile{
			IP:           ip,
			BaseLimit:    100,
			CurrentLimit: 100,
		}
		s.profiles[ip] = prof
	}

	if prof.IsBlocked {
		if now.Before(prof.BlockedUntil) {
			return false, 0, 60
		}
		prof.IsBlocked = false
		prof.CurrentLimit = prof.BaseLimit
	}

	// Filter timestamps in current window
	var valid []time.Time
	for _, t := range prof.RequestsThisWindow {
		if now.Sub(t) <= s.window {
			valid = append(valid, t)
		}
	}
	prof.RequestsThisWindow = valid

	if len(valid) >= prof.CurrentLimit {
		return false, prof.CurrentLimit, 60
	}

	prof.RequestsThisWindow = append(prof.RequestsThisWindow, now)
	return true, prof.CurrentLimit, 0
}

// GetSecurityProfiles returns all tracked client IP profiles.
func (s *AdaptiveRateService) GetSecurityProfiles() []*ClientSecurityProfile {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []*ClientSecurityProfile
	for _, p := range s.profiles {
		list = append(list, p)
	}
	return list
}
