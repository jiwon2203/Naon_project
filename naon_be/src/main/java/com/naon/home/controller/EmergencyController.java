package com.naon.home.controller;

import com.naon.home.dto.EmergencyReportDTO;
import com.naon.home.service.EmergencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/emergency")
public class EmergencyController {
    private final EmergencyService emergencyService;

    @PostMapping("/report")
    public ResponseEntity<Map<String,Object>> report(
            @RequestBody
            @Valid
            EmergencyReportDTO dto) {
        Long id = emergencyService.saveReport(dto);
        return ResponseEntity.ok(Map.of("success", true, "reportId", id));
    }
}
