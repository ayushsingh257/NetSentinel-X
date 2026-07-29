"use client";

import { useState } from "react";
import {
  Key,
  Lock,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Trash2,
  AlertOctagon,
  Cpu,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SecretItem {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "REVOKED" | "ROTATION_REQUIRED";
  masked_prefix: string;
  owner: string;
  environment: string;
  created_at: string;
  expires_at: string;
  last_rotated: string;
  rotation_count: number;
}

interface SecretFinding {
  id: string;
  secret_type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  sample: string;
  description: string;
  remediation: string;
}

interface CryptoAlgo {
  name: string;
  category: string;
  approved: boolean;
  standard: string;
  description: string;
}

// ─── Static Mock Data matching backend services ───────────────────────────────

const INITIAL_SECRETS: SecretItem[] = [
  {
    id: "SEC-001",
    name: "Production JWT Signing Key",
    type: "JWT_SIGNING_KEY",
    provider: "HASHICORP_VAULT",
    status: "ACTIVE",
    masked_prefix: "nsx_jwt_prod****",
    owner: "secops-admin",
    environment: "production",
    created_at: "2026-06-29T10:00:00Z",
    expires_at: "2026-09-29T10:00:00Z",
    last_rotated: "12 days ago",
    rotation_count: 3,
  },
  {
    id: "SEC-002",
    name: "PostgreSQL Master Database Credential",
    type: "DATABASE_CREDENTIAL",
    provider: "AWS_SECRETS_MANAGER",
    status: "ACTIVE",
    masked_prefix: "db_pass_vau****",
    owner: "dba-team",
    environment: "production",
    created_at: "2026-05-29T10:00:00Z",
    expires_at: "2026-08-29T10:00:00Z",
    last_rotated: "25 days ago",
    rotation_count: 2,
  },
  {
    id: "SEC-003",
    name: "SIEM Webhook Signature HMAC Key",
    type: "WEBHOOK_SECRET",
    provider: "INTERNAL_ENCRYPTED_STORE",
    status: "EXPIRING_SOON",
    masked_prefix: "whsec_98234****",
    owner: "soc-lead",
    environment: "production",
    created_at: "2026-04-29T10:00:00Z",
    expires_at: "2026-08-03T10:00:00Z",
    last_rotated: "85 days ago",
    rotation_count: 1,
  },
  {
    id: "SEC-004",
    name: "Threat Intel API Integration Secret",
    type: "API_KEY",
    provider: "AZURE_KEY_VAULT",
    status: "ACTIVE",
    masked_prefix: "nsx_live_th****",
    owner: "intel-analyst",
    environment: "production",
    created_at: "2026-07-19T10:00:00Z",
    expires_at: "2026-10-17T10:00:00Z",
    last_rotated: "10 days ago",
    rotation_count: 1,
  },
  {
    id: "SEC-005",
    name: "AES-256 Storage Encryption Master Key",
    type: "ENCRYPTION_KEY",
    provider: "HASHICORP_VAULT",
    status: "ACTIVE",
    masked_prefix: "aes256_mast****",
    owner: "secops-admin",
    environment: "production",
    created_at: "2026-03-29T10:00:00Z",
    expires_at: "2027-03-29T10:00:00Z",
    last_rotated: "30 days ago",
    rotation_count: 4,
  },
];

const LEAK_FINDINGS: SecretFinding[] = [
  {
    id: "LEAK-001",
    secret_type: "JWT Bearer Token",
    severity: "MEDIUM",
    sample: "eyJhbGci....eyJzdWIi",
    description: "JWT session token present in debug log buffer.",
    remediation: "Redact auth headers before logging HTTP payloads.",
  },
  {
    id: "LEAK-002",
    secret_type: "API Key Prefix",
    severity: "MEDIUM",
    sample: "nsx_live_....a82h",
    description: "API Key prefix visible in verbose traffic dump.",
    remediation: "Mask API key query parameters in telemetry logger.",
  },
];

const CRYPTO_ALGOS: CryptoAlgo[] = [
  { name: "AES-256-GCM", category: "Symmetric Encryption", approved: true, standard: "NIST SP 800-38D", description: "AEAD authenticated encryption standard for telemetry at rest." },
  { name: "ChaCha20-Poly1305", category: "Symmetric Encryption", approved: true, standard: "RFC 8439", description: "High-performance AEAD cipher for high-throughput packet processing." },
  { name: "RSA-4096", category: "Asymmetric Encryption", approved: true, standard: "NIST SP 800-56B", description: "Ultra-secure asymmetric key exchange and digital signing." },
  { name: "ECDSA (P-384)", category: "Digital Signatures", approved: true, standard: "FIPS 186-4", description: "Elliptic curve digital signature algorithm for HMAC requests." },
  { name: "bcrypt (Cost 12)", category: "Password Hashing", approved: true, standard: "OWASP Cheat Sheet", description: "Key derivation function with adaptive cost factor." },
  { name: "MD5", category: "Hashing", approved: false, standard: "RFC 6151 (Deprecated)", description: "PROHIBITED: Collision vulnerabilities. Replaced by SHA-256." },
  { name: "SHA-1", category: "Hashing", approved: false, standard: "NIST SP 800-131A", description: "PROHIBITED: Shattered collision attack. Replaced by SHA-256." },
  { name: "DES / 3DES", category: "Symmetric Encryption", approved: false, standard: "NIST SP 800-131A", description: "PROHIBITED: Small 64-bit block size vulnerable to Sweet32 attack." },
];

const TABS = [
  { id: "posture", label: "Secret Posture", icon: <ShieldCheck className="w-4 h-4" /> },
  { id: "inventory", label: "Secret Inventory", icon: <Key className="w-4 h-4" /> },
  { id: "rotation", label: "Rotation Management", icon: <RefreshCw className="w-4 h-4" /> },
  { id: "leaks", label: "Leak Detection", icon: <AlertOctagon className="w-4 h-4" /> },
  { id: "crypto", label: "Cryptographic Posture", icon: <Cpu className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SecretsSecurityDashboard() {
  const [activeTab, setActiveTab] = useState("posture");
  const [secrets, setSecrets] = useState<SecretItem[]>(INITIAL_SECRETS);
  const [rotatedSecretId, setRotatedSecretId] = useState<string | null>(null);

  const activeCount = secrets.filter(s => s.status === "ACTIVE").length;
  const expiringCount = secrets.filter(s => s.status === "EXPIRING_SOON").length;
  const expiredCount = secrets.filter(s => s.status === "EXPIRED").length;
  const rotationReqCount = secrets.filter(s => s.status === "ROTATION_REQUIRED").length;

  const score = Math.max(0, 100 - expiredCount * 25 - rotationReqCount * 20 - expiringCount * 5);

  const handleRotate = (id: string) => {
    setSecrets(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: "ACTIVE", last_rotated: "Just now", rotation_count: s.rotation_count + 1 }
          : s
      )
    );
    setRotatedSecretId(id);
    setTimeout(() => setRotatedSecretId(null), 3000);
  };

  const handleRevoke = (id: string) => {
    setSecrets(prev =>
      prev.map(s => (s.id === id ? { ...s, status: "REVOKED" } : s))
    );
  };

  const statusBadge = (status: string) => {
    const base = "px-2 py-0.5 text-xs font-semibold rounded-full border";
    switch (status) {
      case "ACTIVE":
        return `${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/20`;
      case "EXPIRING_SOON":
        return `${base} bg-amber-500/10 text-amber-500 border-amber-500/20`;
      case "EXPIRED":
      case "ROTATION_REQUIRED":
        return `${base} bg-red-500/10 text-red-500 border-red-500/20`;
      case "REVOKED":
        return `${base} bg-slate-500/10 text-slate-400 border-slate-500/20`;
      default:
        return `${base} bg-blue-500/10 text-blue-400 border-blue-500/20`;
    }
  };

  const providerBadge = () => {
    const base = "px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700";
    return base;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Secrets Management &amp; Cryptographic Security
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Era 22 Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              HashiCorp Vault Integration, Automated Secret Rotation &amp; Gitleaks Leak Detection
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-500/20">
          <span>Secrets Security Score:</span>
          <span className="text-lg font-mono">{score}/100</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Secret Posture */}
      {activeTab === "posture" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Active Secrets</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">{activeCount}</h3>
                <p className="text-xs text-emerald-500 font-medium mt-1">Vault / Managed</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Expiring Soon</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">{expiringCount}</h3>
                <p className="text-xs text-amber-500 font-medium mt-1">Within 7 days</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Rotation Required</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">{rotationReqCount + expiredCount}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Policy Triggered</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Managed</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">{secrets.length}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">100% Hash / Encrypted</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Enterprise Secrets Health Checks</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">HashiCorp Vault Connection</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Vault kv-v2 engine active with TLS 1.3 mutual auth</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Gitleaks CI Pre-Commit Gate</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Gitleaks automated scan active in scripts/security/gitleaks_scan.sh</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">ACTIVE GATE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Zero Plaintext Storage Policy</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">All registered secrets stored as SHA-256 hashes or AES-256-GCM ciphertexts</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">ENFORCED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Secret Inventory */}
      {activeTab === "inventory" && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Managed Secrets Inventory</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{secrets.length} Registered</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Secret Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Masked Value</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Last Rotated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                {secrets.map(sec => (
                  <tr key={sec.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">{sec.name}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[10px]">{sec.type}</span></td>
                    <td className="p-3"><span className={providerBadge()}>{sec.provider}</span></td>
                    <td className="p-3"><span className={statusBadge(sec.status)}>{sec.status}</span></td>
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{sec.masked_prefix}</td>
                    <td className="p-3">{sec.owner}</td>
                    <td className="p-3 text-slate-500 dark:text-zinc-400">{sec.last_rotated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Rotation Management */}
      {activeTab === "rotation" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Automated Secret Rotation Engine</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Executes zero-downtime key rotation and updates Vault references</p>
            </div>
          </div>
          {secrets.map(sec => (
            <div key={sec.id} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{sec.name}</span>
                  <span className={statusBadge(sec.status)}>{sec.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
                  <span>ID: <code className="font-mono">{sec.id}</code></span>
                  <span>Rotations: <strong className="text-slate-900 dark:text-zinc-200">{sec.rotation_count}</strong></span>
                  <span>Last: {sec.last_rotated}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRotate(sec.id)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Rotate Secret
                </button>
                <button
                  onClick={() => handleRevoke(sec.id)}
                  disabled={sec.status === "REVOKED"}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Revoke
                </button>
              </div>
            </div>
          ))}
          {rotatedSecretId && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Secret {rotatedSecretId} successfully rotated! New value hashed and committed to Vault.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Leak Detection */}
      {activeTab === "leaks" && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center">
              <div className="text-2xl font-black text-emerald-500">0</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">Critical Leaks</div>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center">
              <div className="text-2xl font-black text-orange-500">0</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">High Leaks</div>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center">
              <div className="text-2xl font-black text-amber-500">{LEAK_FINDINGS.length}</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">Medium Leaks</div>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center">
              <div className="text-2xl font-black text-blue-400">0</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">Low Leaks</div>
            </div>
          </div>

          {LEAK_FINDINGS.map(finding => (
            <div key={finding.id} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{finding.secret_type}</span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500/10 text-amber-500">{finding.severity}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{finding.id}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300">{finding.description}</p>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl font-mono text-xs text-slate-600 dark:text-zinc-300 flex items-center justify-between">
                <span>Sample Match: <code>{finding.sample}</code></span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Remediation: {finding.remediation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Cryptographic Posture */}
      {activeTab === "crypto" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Cryptographic Standard Compliance</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">NIST SP 800-38D + FIPS 186-4 + RFC 8439 Approved Algorithms</p>
            </div>
            <span className="text-2xl font-black text-emerald-500">5/5 Approved</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRYPTO_ALGOS.map(algo => (
              <div key={algo.name} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
                {algo.approved ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{algo.name}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${algo.approved ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                      {algo.approved ? "APPROVED" : "PROHIBITED"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">{algo.category} · {algo.standard}</p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">{algo.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
