package com.fury.devsecops.backend.repository;

import com.fury.devsecops.backend.entity.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    List<Deployment> findTop20ByOrderByDeployedAtDesc();
}
