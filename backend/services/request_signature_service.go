package services

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"time"
)

type RequestSignatureService struct {
	maxDriftSeconds int64
}

func NewRequestSignatureService() *RequestSignatureService {
	return &RequestSignatureService{
		maxDriftSeconds: 300, // 5 minutes max clock drift allowed
	}
}

// ComputeSignature calculates HMAC-SHA256(body + timestamp + secret).
func (s *RequestSignatureService) ComputeSignature(body []byte, timestampStr, secret string) string {
	message := append(body, []byte(timestampStr)...)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(message)
	return hex.EncodeToString(mac.Sum(nil))
}

// VerifySignature validates timestamp freshness and HMAC signature integrity.
func (s *RequestSignatureService) VerifySignature(body []byte, timestampStr, signature, secret string) (bool, string) {
	if timestampStr == "" || signature == "" {
		return false, "SIGNATURE_HEADERS_MISSING"
	}

	ts, err := strconv.ParseInt(timestampStr, 10, 64)
	if err != nil {
		return false, "INVALID_TIMESTAMP_FORMAT"
	}

	now := time.Now().Unix()
	drift := now - ts
	if drift < 0 {
		drift = -drift
	}

	if drift > s.maxDriftSeconds {
		return false, fmt.Sprintf("TIMESTAMP_EXPIRED_REPLAY_RISK (Drift %ds > 300s)", drift)
	}

	expectedSig := s.ComputeSignature(body, timestampStr, secret)
	if !hmac.Equal([]byte(signature), []byte(expectedSig)) {
		return false, "SIGNATURE_MISMATCH_TAMPERED_BODY"
	}

	return true, "VALID"
}
