package com.naon.home.service;

import com.naon.home.dto.EmergencyReportDTO;
import com.naon.home.entity.EmergencyReport;
import com.naon.home.entity.Member;
import com.naon.home.repository.EmergencyReportRepository;
import com.naon.home.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmergencyService {
    private final MemberRepository memberRepository;
    private final EmergencyReportRepository emergencyReportRepository;

    @Transactional
    public Long saveReport(EmergencyReportDTO dto) {
        Member member = memberRepository.findByMid(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        EmergencyReport report = EmergencyReport.builder()
                .member(member)
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .accuracy(dto.getAccuracy())
                .address(dto.getAddress())
                .build();

        emergencyReportRepository.save(report);
        return report.getId();
    }
}
