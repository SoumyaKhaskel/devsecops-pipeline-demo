package com.fury.devsecops.backend;

import com.fury.devsecops.backend.entity.SecurityReport;
import com.fury.devsecops.backend.entity.Deployment;
import com.fury.devsecops.backend.repository.SecurityReportRepository;
import com.fury.devsecops.backend.repository.DeploymentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final SecurityReportRepository securityReportRepository;
    private final DeploymentRepository deploymentRepository;

    public DashboardController(SecurityReportRepository securityReportRepository,
                                DeploymentRepository deploymentRepository) {
        this.securityReportRepository = securityReportRepository;
        this.deploymentRepository = deploymentRepository;
    }

    @GetMapping("/latest-score")
    public Map<String, Object> latestScore() {
        SecurityReport latest = securityReportRepository.findFirstByOrderByGeneratedAtDesc();
        if (latest == null) {
            return Map.of("security_score", 0, "message", "No reports yet");
        }
        return Map.of(
            "security_score", latest.getSecurityScore(),
            "total_findings", latest.getTotalFindings(),
            "critical", latest.getCriticalCount(),
            "high", latest.getHighCount(),
            "medium", latest.getMediumCount(),
            "low", latest.getLowCount(),
            "generated_at", latest.getGeneratedAt().toString(),
            "commit_sha", latest.getCommitSha(),
            "branch", latest.getBranch()
        );
    }

    @GetMapping("/score-trend")
    public List<SecurityReport> scoreTrend() {
        return securityReportRepository.findTop20ByOrderByGeneratedAtDesc();
    }

    @GetMapping("/deployments")
    public List<Deployment> deployments() {
        return deploymentRepository.findTop20ByOrderByDeployedAtDesc();
    }
}
