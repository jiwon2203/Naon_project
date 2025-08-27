package com.naon.home.repository;

import com.naon.home.entity.EmergencyReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmergencyReportRepository extends JpaRepository<EmergencyReport, Long> {
}
