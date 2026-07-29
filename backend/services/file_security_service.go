package services

import (
	"path/filepath"
	"regexp"
	"strings"
	"sync"
)

type FileValidationResult struct {
	Allowed           bool     `json:"allowed"`
	Filename          string   `json:"filename"`
	SanitizedFilename string   `json:"sanitized_filename"`
	Extension         string   `json:"extension"`
	DetectedMIME      string   `json:"detected_mime"`
	Risk              string   `json:"risk"` // LOW, MEDIUM, HIGH, CRITICAL
	Reason            string   `json:"reason,omitempty"`
	AllowedExtensions []string `json:"allowed_extensions"`
}

type FileSecurityService struct {
	mu                 sync.RWMutex
	allowedExtensions  map[string]string // ext -> default MIME
	blockedExtensions  map[string]bool
	unsafeCharsPattern *regexp.Regexp
}

func NewFileSecurityService() *FileSecurityService {
	return &FileSecurityService{
		allowedExtensions: map[string]string{
			".pdf":  "application/pdf",
			".json": "application/json",
			".csv":  "text/csv",
			".txt":  "text/plain",
		},
		blockedExtensions: map[string]bool{
			".exe":  true,
			".sh":   true,
			".bat":  true,
			".js":   true,
			".html": true,
			".htm":  true,
			".php":  true,
			".py":   true,
			".dll":  true,
			".so":   true,
			".vbs":  true,
			".ps1":  true,
		},
		unsafeCharsPattern: regexp.MustCompile(`[^a-zA-Z0-9._-]`),
	}
}

// ValidateFile checks file name, extension, MIME type, and size.
func (f *FileSecurityService) ValidateFile(filename string, declaredMIME string, fileSize int64) FileValidationResult {
	f.mu.RLock()
	defer f.mu.RUnlock()

	cleanedName := filepath.Base(filename)
	sanitizedName := f.unsafeCharsPattern.ReplaceAllString(cleanedName, "_")
	ext := strings.ToLower(filepath.Ext(sanitizedName))

	allowedExtList := []string{".pdf", ".json", ".csv", ".txt"}

	// Size Limit check (Max 10MB)
	if fileSize > 10*1024*1024 {
		return FileValidationResult{
			Allowed:           false,
			Filename:          cleanedName,
			SanitizedFilename: sanitizedName,
			Extension:         ext,
			DetectedMIME:      declaredMIME,
			Risk:              "HIGH",
			Reason:            "File size exceeds maximum threshold (10MB)",
			AllowedExtensions: allowedExtList,
		}
	}

	// Blocked extension check
	if f.blockedExtensions[ext] {
		return FileValidationResult{
			Allowed:           false,
			Filename:          cleanedName,
			SanitizedFilename: sanitizedName,
			Extension:         ext,
			DetectedMIME:      declaredMIME,
			Risk:              "CRITICAL",
			Reason:            "File type is explicitly blocked due to executable/script security risk",
			AllowedExtensions: allowedExtList,
		}
	}

	// Allowed extension check
	expectedMIME, allowed := f.allowedExtensions[ext]
	if !allowed {
		return FileValidationResult{
			Allowed:           false,
			Filename:          cleanedName,
			SanitizedFilename: sanitizedName,
			Extension:         ext,
			DetectedMIME:      declaredMIME,
			Risk:              "HIGH",
			Reason:            "Extension not in enterprise file allowlist",
			AllowedExtensions: allowedExtList,
		}
	}

	// MIME check
	if declaredMIME != "" && !strings.Contains(strings.ToLower(declaredMIME), strings.ToLower(expectedMIME)) && !strings.Contains(declaredMIME, "octet-stream") {
		return FileValidationResult{
			Allowed:           false,
			Filename:          cleanedName,
			SanitizedFilename: sanitizedName,
			Extension:         ext,
			DetectedMIME:      declaredMIME,
			Risk:              "MEDIUM",
			Reason:            "MIME type mismatch for file extension",
			AllowedExtensions: allowedExtList,
		}
	}

	return FileValidationResult{
		Allowed:           true,
		Filename:          cleanedName,
		SanitizedFilename: sanitizedName,
		Extension:         ext,
		DetectedMIME:      expectedMIME,
		Risk:              "LOW",
		AllowedExtensions: allowedExtList,
	}
}
