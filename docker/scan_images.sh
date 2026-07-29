#!/usr/bin/env bash
# docker/scan_images.sh — Era 21 Container Image Security Scanning
# Scans all NetSentinel-X container images with Trivy for known CVEs.
#
# Usage:
#   ./docker/scan_images.sh [--severity HIGH,CRITICAL] [--exit-code 1]
#
# Prerequisites:
#   - Trivy installed: https://aquasecurity.github.io/trivy/
#   - Docker images built before running this script
#
# Exit codes:
#   0 = No vulnerabilities found above threshold
#   1 = Vulnerabilities found or scan failed

set -euo pipefail

SEVERITY="${1:-HIGH,CRITICAL}"
IMAGES=("netsentinel-backend:latest" "netsentinel-frontend:latest")

echo "╔══════════════════════════════════════════════════╗"
echo "║  NetSentinel-X — Era 21 Container Image Scanner ║"
echo "║  Trivy Vulnerability Scan                        ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Check Trivy is available
if ! command -v trivy &>/dev/null; then
    echo "❌ Trivy not found. Install: https://aquasecurity.github.io/trivy/"
    exit 1
fi

SCAN_FAILED=0

for IMAGE in "${IMAGES[@]}"; do
    echo "🔍 Scanning: $IMAGE"
    echo "────────────────────────────────────────"

    if ! docker image inspect "$IMAGE" &>/dev/null; then
        echo "⚠️  Image $IMAGE not found. Skipping (build first)."
        echo ""
        continue
    fi

    if trivy image \
        --severity "$SEVERITY" \
        --exit-code 1 \
        --no-progress \
        --format table \
        "$IMAGE"; then
        echo "✅ $IMAGE — No $SEVERITY vulnerabilities found"
    else
        echo "❌ $IMAGE — Vulnerabilities detected at $SEVERITY level"
        SCAN_FAILED=1
    fi
    echo ""
done

echo "════════════════════════════════════════════════════"
if [[ $SCAN_FAILED -eq 0 ]]; then
    echo "✅ All images passed vulnerability scan."
    exit 0
else
    echo "❌ Vulnerability scan FAILED. Do NOT deploy to production."
    exit 1
fi
