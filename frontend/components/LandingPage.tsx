"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { FlickeringFooter } from "./ui/flickering-footer";
import {
  Activity,
  Bot,
  Cpu,
  Radio,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Terminal,
  Server,
  BarChart2,
  Sliders,
  CheckCircle2
} from "lucide-react";

type CapabilityTab = "dpi" | "copilot" | "mitre" | "detection";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<CapabilityTab>("copilot");

  const [metrics, setMetrics] = useState({
    packetsProcessed: 148920,
    activeThreats: 3,
    mitreMapped: 14,
    aiReasoningTimeMs: 42,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        packetsProcessed: prev.packetsProcessed + Math.floor(Math.random() * 25) + 5,
        aiReasoningTimeMs: 38 + Math.floor(Math.random() * 10),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 border-b border-zinc-900">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-8 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>NetSentinel-X v2.0 Enterprise Release</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span className="text-zinc-400">AI-Powered SOC Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              Next-Generation <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]">
                AI Security Operations
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl font-normal leading-relaxed mb-10">
              Autonomous Deep Packet Inspection, Real-time Telemetry, RAG Threat Reasoning, MITRE ATT&CK Mapping, and Incident Response in a single unified platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_45px_rgba(34,211,238,0.7)] transition-all duration-300 active:scale-95"
              >
                <BarChart2 className="w-5 h-5" />
                <span>Launch SOC Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#architecture"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-zinc-300 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all duration-300"
              >
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Explore Architecture</span>
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-4xl p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
              <div className="p-3 text-left">
                <p className="text-xs text-zinc-400 font-medium">Packets Ingested</p>
                <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
                  {metrics.packetsProcessed.toLocaleString()}
                </p>
              </div>
              <div className="p-3 text-left">
                <p className="text-xs text-zinc-400 font-medium">AI Reasoning Latency</p>
                <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                  {metrics.aiReasoningTimeMs} ms
                </p>
              </div>
              <div className="p-3 text-left">
                <p className="text-xs text-zinc-400 font-medium">MITRE Techniques</p>
                <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
                  {metrics.mitreMapped} Active
                </p>
              </div>
              <div className="p-3 text-left">
                <p className="text-xs text-zinc-400 font-medium">Active Threat Stream</p>
                <p className="text-2xl font-extrabold text-red-400 font-mono mt-1">
                  {metrics.activeThreats} Flagged
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Enterprise Feature Showcase Tabs */}
      <section className="py-20 border-b border-zinc-900 bg-zinc-950/60 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">Enterprise Core Capabilities</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Engineered for Enterprise SOC Operations
            </h3>
            <p className="text-zinc-400 mt-4 text-base">
              Built on Go eBPF packet capture, zero-latency websockets, and intelligent threat reasoning engines.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {[
              { id: "copilot", label: "AI Security Copilot", icon: Bot, color: "text-purple-400" },
              { id: "dpi", label: "Realtime DPI Telemetry", icon: Radio, color: "text-cyan-400" },
              { id: "mitre", label: "MITRE ATT&CK Mapping", icon: Activity, color: "text-amber-400" },
              { id: "detection", label: "Detection Engineering", icon: Sliders, color: "text-emerald-400" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CapabilityTab)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                    isSelected
                      ? "bg-zinc-800 text-white border border-cyan-500/60 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <div className="lg:col-span-5 space-y-6">
              {activeTab === "copilot" && (
                <>
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-400 w-fit">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">Autonomous AI Security Assistant</h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Uses RAG (Retrieval-Augmented Generation) over live telemetry, DPI payloads, and historical logs to answer complex SOC questions without hallucination.
                  </p>
                  <ul className="space-y-2.5 text-sm text-zinc-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Natural language packet inspection (&quot;Explain this DNS query&quot;)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Instant threat correlation &amp; root-cause analysis</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Automated SOC investigation note generation</li>
                  </ul>
                </>
              )}

              {activeTab === "dpi" && (
                <>
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 w-fit">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">Deep Packet Inspection Engine</h4>
                  <p className="text-zinc-400 leading-relaxed">
                    High-throughput Go packet capture parsing Ethernet, IP, TCP, UDP, DNS, HTTP, and TLS headers with sub-millisecond protocol dissecting.
                  </p>
                  <ul className="space-y-2.5 text-sm text-zinc-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Sub-millisecond packet processing pipeline</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Real-time WebSocket streaming to frontend</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Automatic GeoIP and ASN metadata enrichment</li>
                  </ul>
                </>
              )}

              {activeTab === "mitre" && (
                <>
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-400 w-fit">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">Real-time MITRE ATT&amp;CK Radar</h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Maps detected anomalies and packet alerts directly to MITRE tactics and techniques (e.g. Command &amp; Control, Exfiltration, Brute Force).
                  </p>
                  <ul className="space-y-2.5 text-sm text-zinc-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Visual ATT&amp;CK matrix coverage grid</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Automated procedure &amp; mitigation matching</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Risk level calculation per affected host</li>
                  </ul>
                </>
              )}

              {activeTab === "detection" && (
                <>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 w-fit">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">Detection Engineering Studio</h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Custom rule creation studio for SOC engineers using Sigma-inspired logic, threshold rules, protocol filters, and interactive alert testing.
                  </p>
                  <ul className="space-y-2.5 text-sm text-zinc-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom YARA &amp; Sigma syntax support</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time rule simulation against live traffic</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> False positive reduction recommendation engine</li>
                  </ul>
                </>
              )}

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 pt-2 group"
              >
                <span>View Live Dashboard Demonstration</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="lg:col-span-7 bg-black rounded-2xl border border-zinc-800 p-6 font-mono text-xs overflow-hidden shadow-inner">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                  <span className="text-zinc-400 font-sans text-xs ml-2">netsentinel-x-ai-copilot.log</span>
                </div>
                <span className="text-cyan-400 text-[11px] font-sans bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">RAG ENGINE: ACTIVE</span>
              </div>

              {activeTab === "copilot" && (
                <div className="space-y-3 text-zinc-300">
                  <p className="text-zinc-400">[SYSTEM] Context loaded: 1,489 Packets | 3 Active Alerts | 2 Hosts</p>
                  <p className="text-purple-400 font-semibold">&gt; USER: &quot;Is the DNS traffic to 185.220.101.5 suspicious?&quot;</p>
                  <div className="p-3 rounded bg-zinc-900/90 border border-purple-950/80 text-zinc-300 space-y-1.5">
                    <p className="text-purple-300 font-bold">[AI COPILOT REASONING]</p>
                    <p>• Packet Analysis: 14 rapid TXT query bursts detected within 500ms.</p>
                    <p>• MITRE Technique Match: T1071.004 (Application Layer Protocol: DNS Tunneling).</p>
                    <p>• Threat Intel Score: AbuseIPDB Confidence 88% (Tor Exit Node / Beaconing Host).</p>
                    <p className="text-emerald-400 font-bold pt-1">• Action: Isolating host 192.168.1.105 &amp; generating incident ticket #INC-8092.</p>
                  </div>
                </div>
              )}

              {activeTab === "dpi" && (
                <div className="space-y-2 text-zinc-300">
                  <p className="text-cyan-400">[DPI STREAM] Packet #148920 Parsed in 0.28ms</p>
                  <p className="text-zinc-400">SRC: 192.168.1.45:54320 -&gt; DST: 10.0.0.1:443 [TLS v1.3 / Application Data]</p>
                  <p className="text-zinc-400">Header Length: 54 bytes | Payload: 1420 bytes | GeoIP: US (AWS East)</p>
                  <p className="text-emerald-400 font-bold">[INSPECTION CLEAN] Signature matched: HTTPS Standard Enterprise Traffic</p>
                </div>
              )}

              {activeTab === "mitre" && (
                <div className="space-y-2 text-zinc-300">
                  <p className="text-amber-400">[MITRE ATT&amp;CK ENGINE] Active Coverage Grid</p>
                  <p>• T1110.001 (Brute Force: Password Guessing) -&gt; 2 Alerts (Port 22/SSH)</p>
                  <p>• T1048.003 (Exfiltration Over Alternative Protocol) -&gt; 1 Alert (Port 53/DNS)</p>
                  <p>• T1059.004 (Unix Shell Command Execution) -&gt; 0 Alerts (Monitoring)</p>
                </div>
              )}

              {activeTab === "detection" && (
                <div className="space-y-2 text-zinc-300">
                  <p className="text-emerald-400">[SIGMA RULE] rule_dns_beaconing.yml</p>
                  <p className="text-zinc-400">title: DNS Tunneling Detection Rule</p>
                  <p className="text-zinc-400">condition: dns.query_length &gt; 60 and count() by src_ip &gt; 10 in 1m</p>
                  <p className="text-emerald-300 font-bold">[SIMULATION] Status: Validated (0 False Positives on 100k packets)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Architecture Workflow Section */}
      <section id="architecture" className="py-20 border-b border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">Enterprise Data Pipeline</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              End-to-End Threat Intelligence Flow
            </h3>
            <p className="text-zinc-400 mt-4 text-base">
              From raw network interface ingestion to AI reasoning and automated SOC containment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              { step: "01", title: "eBPF Packet Monitor", desc: "Captures raw ethernet frames with zero kernel overhead.", icon: Server },
              { step: "02", title: "Go DPI Parser", desc: "Dissects protocol headers and payload metadata in <1ms.", icon: Terminal },
              { step: "03", title: "Threat Intel Fusion", desc: "Enriches IPs & domains against VirusTotal, OTX, & AbuseIPDB.", icon: Radio },
              { step: "04", title: "RAG Threat Engine", desc: "Correlates packet alerts with MITRE ATT&CK tactics.", icon: Bot },
              { step: "05", title: "Autonomous Playbooks", desc: "Generates reports, alerts analyst, & triggers response.", icon: Activity },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div key={st.step} className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 relative hover:border-cyan-500/50 transition-all duration-300">
                  <span className="text-xs font-mono text-cyan-400 font-bold mb-3 block">STAGE {st.step}</span>
                  <Icon className="w-7 h-7 text-white mb-4" />
                  <h4 className="text-base font-bold text-white mb-2">{st.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Onboarding & System Setup Guide */}
      <section className="py-16 bg-zinc-950/80 border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Protect Your Infrastructure?</h3>
          <p className="text-zinc-400 text-sm mb-8">
            NetSentinel-X V2 integrates with Docker, eBPF, and standard Linux kernel network interfaces.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              Open SOC Dashboard
            </Link>
            <a
              href="#docs"
              className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm border border-zinc-800"
            >
              Read Architecture Docs
            </a>
          </div>
        </div>
      </section>

      <FlickeringFooter />
    </div>
  );
}
