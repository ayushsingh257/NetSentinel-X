"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileCheck,
  Download,
  Award,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
  X
} from "lucide-react";

export interface Report {
  id: string;
  title: string;
  type: string;
  ai_summary: string;
  business_impact: string;
  security_score: number;
  threat_overview: string;
  control_coverage_map: Record<string, number>;
  compliance_status_map: Record<string, string>;
  generated_at: string;
  generated_by: string;
  export_formats_available: string[];
  evidence_items_count: number;
}

export interface ComplianceFramework {
  framework: string;
  overall_status: string;
  passed_controls: number;
  total_controls: number;
  compliance_score: number;
  control_gaps: string[];
}

export default function ExecutiveReporting() {
  const [reports, setReports] = useState<Report[]>([]);
  const [frameworks, setFrameworks] = useState<Record<string, ComplianceFramework>>({});
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "compliance">("dashboard");

  // Generate Report Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genTitle, setGenTitle] = useState("");
  const [genType, setGenType] = useState("EXECUTIVE");

  const fetchReportData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const [repRes, compRes] = await Promise.all([
        fetch(`${apiUrl}/api/v2/reports`),
        fetch(`${apiUrl}/api/v2/compliance`),
      ]);

      if (repRes.ok) {
        const data = await repRes.json();
        const list = data.reports || [];
        setReports(list);
        if (list.length > 0) {
          setSelectedReport(list[0]);
        }
      }

      if (compRes.ok) {
        const data = await compRes.json();
        setFrameworks(data.frameworks || {});
      }
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      const mockReports: Report[] = [
        {
          id: "REP-2026-001",
          title: "Q3 Executive Security Posture & Risk Assessment",
          type: "EXECUTIVE",
          ai_summary: "During the reporting period, 2 critical C2 beaconing incidents were isolated with zero operational downtime. Overall enterprise security posture score remains high at 94/100.",
          business_impact: "Zero data breach loss. Isolated suspicious outbound HTTPS traffic on VLAN-10 within 10 minutes of initial detection.",
          security_score: 94,
          threat_overview: "Analyzed 1.4M network packets. Identified 2 C2 beaconing anomalies.",
          control_coverage_map: { "Access Control": 98, "Telemetry Logging": 100 },
          compliance_status_map: { "SOC 2": "COMPLIANT", "ISO 27001": "COMPLIANT", "HIPAA": "COMPLIANT" },
          generated_at: new Date().toISOString(),
          generated_by: "AI Security Analyst",
          export_formats_available: ["PDF", "HTML", "MARKDOWN", "JSON"],
          evidence_items_count: 14,
        },
      ];

      const mockFrameworks: Record<string, ComplianceFramework> = {
        SOC2: { framework: "SOC2", overall_status: "COMPLIANT", passed_controls: 24, total_controls: 24, compliance_score: 100, control_gaps: [] },
        ISO27001: { framework: "ISO27001", overall_status: "COMPLIANT", passed_controls: 92, total_controls: 94, compliance_score: 97, control_gaps: ["A.12.6.1 Vulnerability Management Cadence"] },
        HIPAA: { framework: "HIPAA", overall_status: "COMPLIANT", passed_controls: 18, total_controls: 18, compliance_score: 100, control_gaps: [] },
      };

      setReports(mockReports);
      setFrameworks(mockFrameworks);
      setSelectedReport(mockReports[0]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchReportData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchReportData]);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/v2/reports/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: genType,
          title: genTitle,
        }),
      });

      if (res.ok) {
        setShowGenerateModal(false);
        setGenTitle("");
        void fetchReportData();
      }
    } catch (err) {
      console.error("Generate report failed:", err);
    }
  };

  const handleExport = (format: string) => {
    if (!selectedReport) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    if (format === "HTML") {
      window.open(`${apiUrl}/api/v2/reports/export/${selectedReport.id}`, "_blank");
    } else {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(selectedReport, null, 2)], { type: "application/json" });
      element.href = URL.createObjectURL(file);
      element.download = `${selectedReport.id}_report.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="bg-zinc-950 border border-teal-500/40 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal-950/80 border border-teal-500/50 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.25)]">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Executive Reporting &amp; Compliance Engine
              <span className="text-xs px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono">
                CISO &amp; Audit Ready v2.0
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Automated CISO Security Summaries, SOC 2 / ISO 27001 / HIPAA Compliance Mapping</p>
          </div>
        </div>

        {/* Tab Selector & Generate CTA */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "dashboard"
                  ? "bg-teal-950 text-teal-300 border border-teal-800"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Report Library</span>
            </button>
            <button
              onClick={() => setActiveTab("compliance")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "compliance"
                  ? "bg-teal-950 text-teal-300 border border-teal-800"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-teal-400" />
              <span>Compliance Frameworks</span>
            </button>
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-black font-bold shadow-[0_0_15px_rgba(20,184,166,0.4)] transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Executive Security Posture Overview Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">Enterprise Security Score</span>
          <span className="text-lg font-bold text-teal-400">94 / 100 Optimal</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">SOC 2 Type II Status</span>
          <span className="text-lg font-bold text-emerald-400">100% Compliant</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">ISO 27001:2022 Status</span>
          <span className="text-lg font-bold text-cyan-400">97% Compliant</span>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] block uppercase">HIPAA Security Rule</span>
          <span className="text-lg font-bold text-emerald-400">100% Compliant</span>
        </div>
      </div>

      {/* Main Tab View */}
      {activeTab === "dashboard" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-xs">
          
          {/* Reports Table */}
          <div className="lg:col-span-2 bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-mono text-zinc-400">
              <span>GENERATED ENTERPRISE SECURITY REPORTS</span>
              <span>SECURITY SCORE</span>
            </div>

            <div className="divide-y divide-zinc-800">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedReport?.id === rep.id ? "bg-teal-950/30 border-l-4 border-teal-500" : "hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-950 text-teal-400 border border-zinc-800 font-bold text-[10px]">
                        {rep.type}
                      </span>
                      <span className="font-bold text-white text-sm">{rep.title}</span>
                    </div>
                    <p className="text-zinc-400 text-xs font-mono">
                      Generated by {rep.generated_by} • Evidence Items: {rep.evidence_items_count}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <div className="text-right">
                      <span className="text-lg font-bold text-teal-400 block">{rep.security_score} / 100</span>
                      <span className="text-[9px] text-zinc-500 block uppercase">SCORE</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Report Inspector & Export Card */}
          {selectedReport ? (
            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-4 font-mono">
              <div className="border-b border-zinc-800 pb-3">
                <span className="text-[10px] text-zinc-400 block uppercase">Selected Security Report</span>
                <h4 className="text-base font-bold text-white font-sans pt-1">{selectedReport.title}</h4>
              </div>

              <div className="space-y-2 bg-teal-950/20 border border-teal-900/40 p-4 rounded-xl">
                <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Executive Summary:</span>
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {selectedReport.ai_summary}
                </p>
              </div>

              <div className="space-y-1 p-3 bg-black rounded-xl border border-zinc-800 font-sans text-xs">
                <span className="text-amber-400 font-bold font-mono block">Business Risk &amp; Impact:</span>
                <p className="text-zinc-300">{selectedReport.business_impact}</p>
              </div>

              {/* Export Toolbar */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-zinc-400 block uppercase font-mono">One-Click Report Export</span>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <button
                    onClick={() => handleExport("HTML")}
                    className="py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-black font-bold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export HTML</span>
                  </button>
                  <button
                    onClick={() => handleExport("JSON")}
                    className="py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-teal-400 border border-zinc-800 font-bold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

        </div>
      ) : (
        /* Compliance Frameworks View */
        <div className="space-y-4 font-sans text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            {Object.values(frameworks).map((fw) => (
              <div key={fw.framework} className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-base font-bold text-white">{fw.framework} Audit</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
                    {fw.overall_status}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between p-2 bg-black rounded-lg border border-zinc-800">
                    <span className="text-zinc-400">Passed Controls:</span>
                    <span className="text-emerald-400 font-bold">{fw.passed_controls} / {fw.total_controls}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black rounded-lg border border-zinc-800">
                    <span className="text-zinc-400">Compliance Score:</span>
                    <span className="text-teal-400 font-bold">{fw.compliance_score}%</span>
                  </div>
                </div>

                {fw.control_gaps && fw.control_gaps.length > 0 ? (
                  <div className="space-y-1 bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl font-sans text-xs">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Identified Audit Gap:</span>
                    </span>
                    <p className="text-amber-300 text-[11px]">{fw.control_gaps[0]}</p>
                  </div>
                ) : (
                  <div className="space-y-1 bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl font-sans text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>100% Control Coverage</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-teal-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white text-xs">
            
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute right-5 top-5 p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <FileCheck className="w-4 h-4 text-teal-400" />
              <span>Generate Enterprise Security Report</span>
            </h3>

            <form onSubmit={handleGenerateReport} className="space-y-3 font-sans">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Report Title</label>
                <input
                  type="text"
                  required
                  value={genTitle}
                  onChange={(e) => setGenTitle(e.target.value)}
                  placeholder="e.g. SOC 2 Audit Readiness Brief"
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Report Type</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                >
                  <option value="EXECUTIVE">EXECUTIVE (CISO Summary)</option>
                  <option value="SOC_DAILY">SOC DAILY (Operational Brief)</option>
                  <option value="INCIDENT">INCIDENT (Case Summary)</option>
                  <option value="THREAT_INTEL">THREAT INTEL (IOC Intelligence)</option>
                  <option value="COMPLIANCE">COMPLIANCE (SOC 2 / ISO / HIPAA)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-black font-bold shadow-md"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
