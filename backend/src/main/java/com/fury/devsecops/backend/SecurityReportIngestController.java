package com.fury.devsecops.backend;

import com.fury.devsecops.backend.entity.SecurityReport;
import com.fury.devsecops.backend.repository.SecurityReportRepository;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/security-reports")
public class SecurityReportIngestController {

    private final SecurityReportRepository repository;

    public SecurityReportIngestController(SecurityReportRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public SecurityReport ingest(@RequestBody Map<String, Object> payload) {
        SecurityReport report = new SecurityReport();
        report.setBranch((String) payload.getOrDefault("branch", "unknown"));
        report.setCommitSha((String) payload.getOrDefault("commit_sha", "unknown"));
        report.setSecurityScore(((Number) payload.getOrDefault("security_score", 0)).intValue());
        report.setTotalFindings(((Number) payload.getOrDefault("total_findings", 0)).intValue());

        Map<String, Object> severitySummary = (Map<String, Object>) payload.getOrDefault("severity_summary", Map.of());
        report.setCriticalCount(getCount(severitySummary, "CRITICAL"));
        report.setHighCount(getCount(severitySummary, "HIGH") + getCount(severitySummary, "ERROR"));
        report.setMediumCount(getCount(severitySummary, "MEDIUM") + getCount(severitySummary, "WARNING"));
        report.setLowCount(getCount(severitySummary, "LOW") + getCount(severitySummary, "INFO"));

        report.setFindingsJson(payload.getOrDefault("findings", "[]").toString());
        report.setGeneratedAt(Instant.now());

        return repository.save(report);
    }

    private int getCount(Map<String, Object> summary, String key) {
        Object val = summary.get(key);
        return val != null ? ((Number) val).intValue() : 0;
    }
}
