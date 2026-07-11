#!/usr/bin/env python3
"""
Aggregates Trivy (dependency scan) and Semgrep (SAST) results into a single
structured security report with a computed risk score.

This report is the data source for the Security Audit Dashboard (Stage 5).
"""

import json
import sys
import os
from datetime import datetime, timezone

# Severity weights: higher severity costs more points off a 100-point score.
SEVERITY_WEIGHTS = {
    "CRITICAL": 10,
    "HIGH": 5,
    "MEDIUM": 2,
    "LOW": 1,
    "ERROR": 5,      # Semgrep severity levels
    "WARNING": 2,
    "INFO": 1,
}


def load_json_safe(path):
    """Load a JSON file, returning None if it doesn't exist or is invalid."""
    if not os.path.exists(path):
        print(f"Warning: {path} not found, skipping.")
        return None
    try:
        with open(path, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"Warning: {path} is not valid JSON, skipping.")
        return None


def parse_trivy(trivy_data):
    """Extract vulnerability counts from a Trivy JSON report."""
    findings = []
    if not trivy_data:
        return findings

    for result in trivy_data.get("Results", []):
        for vuln in result.get("Vulnerabilities", []) or []:
            findings.append({
                "source": "trivy",
                "id": vuln.get("VulnerabilityID"),
                "package": vuln.get("PkgName"),
                "severity": vuln.get("Severity", "UNKNOWN").upper(),
                "title": vuln.get("Title", ""),
            })
    return findings


def parse_semgrep(semgrep_data):
    """Extract findings from a Semgrep SARIF report."""
    findings = []
    if not semgrep_data:
        return findings

    runs = semgrep_data.get("runs", [])
    for run in runs:
        for result in run.get("results", []):
            rule_id = result.get("ruleId", "unknown-rule")
            level = result.get("level", "warning").upper()
            message = result.get("message", {}).get("text", "")
            location = ""
            locations = result.get("locations", [])
            if locations:
                phys = locations[0].get("physicalLocation", {})
                artifact = phys.get("artifactLocation", {}).get("uri", "")
                line = phys.get("region", {}).get("startLine", "")
                location = f"{artifact}:{line}"
            findings.append({
                "source": "semgrep",
                "id": rule_id,
                "package": location,
                "severity": level,
                "title": message,
            })
    return findings


def compute_score(findings):
    """Compute a 0-100 security score based on weighted findings."""
    score = 100
    for finding in findings:
        weight = SEVERITY_WEIGHTS.get(finding["severity"], 1)
        score -= weight
    return max(score, 0)


def summarize_by_severity(findings):
    summary = {}
    for finding in findings:
        sev = finding["severity"]
        summary[sev] = summary.get(sev, 0) + 1
    return summary


def main():
    trivy_path = sys.argv[1] if len(sys.argv) > 1 else "trivy-report.json"
    semgrep_path = sys.argv[2] if len(sys.argv) > 2 else "semgrep.sarif"
    output_path = sys.argv[3] if len(sys.argv) > 3 else "security-report.json"

    trivy_data = load_json_safe(trivy_path)
    semgrep_data = load_json_safe(semgrep_path)

    trivy_findings = parse_trivy(trivy_data)
    semgrep_findings = parse_semgrep(semgrep_data)
    all_findings = trivy_findings + semgrep_findings

    score = compute_score(all_findings)
    severity_summary = summarize_by_severity(all_findings)

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "security_score": score,
        "total_findings": len(all_findings),
        "severity_summary": severity_summary,
        "findings": all_findings,
    }

    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"Security score: {score}/100")
    print(f"Total findings: {len(all_findings)}")
    print(f"Severity breakdown: {severity_summary}")
    print(f"Report written to {output_path}")


if __name__ == "__main__":
    main()
