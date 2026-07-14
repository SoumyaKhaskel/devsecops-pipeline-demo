package com.fury.devsecops.backend;

import com.fury.devsecops.backend.entity.Deployment;
import com.fury.devsecops.backend.repository.DeploymentRepository;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/deployments")
public class DeploymentIngestController {

    private final DeploymentRepository repository;

    public DeploymentIngestController(DeploymentRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Deployment ingest(@RequestBody Map<String, Object> payload) {
        Deployment deployment = new Deployment();
        deployment.setActor((String) payload.getOrDefault("actor", "unknown"));
        deployment.setCommitSha((String) payload.getOrDefault("commit_sha", "unknown"));
        deployment.setBranch((String) payload.getOrDefault("branch", "unknown"));
        deployment.setStatus((String) payload.getOrDefault("status", "UNKNOWN"));
        deployment.setDeployedAt(Instant.now());
        return repository.save(deployment);
    }
}
