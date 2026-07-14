package com.fury.devsecops.backend.repository;

import com.fury.devsecops.backend.entity.SecurityReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SecurityReportRepository extends JpaRepository<SecurityReport, Long> {
    List<SecurityReport> findTop20ByOrderByGeneratedAtDesc();
    SecurityReport findFirstByOrderByGeneratedAtDesc();
}
