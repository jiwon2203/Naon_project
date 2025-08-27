package com.naon.domitory.controller;

import com.naon.domitory.dto.AccommodationResponseDto;
import com.naon.domitory.service.AccommodationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam; // RequestParam import
import java.util.Map; // Map import
import org.springframework.data.domain.Page; // Page import
import org.springframework.data.domain.Pageable; // Pageable import
import io.swagger.v3.oas.annotations.Parameter;


import java.util.Map;

@Tag(name = "Accommodation", description = "숙소 정보 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/accommodations")
public class AccommodationController {

    private final AccommodationService accommodationService;

    @Operation(summary = "필터링, 정렬 및 페이지네이션된 숙소 목록 조회")
    @GetMapping
    public ResponseEntity<Page<AccommodationResponseDto>> getAccommodations(
            @RequestParam Map<String, String> filters,
            @Parameter(hidden = true) Pageable pageable,
            // ⭐ 1. 'sort' 파라미터를 받도록 추가 (기본값 "solo")
            @RequestParam(defaultValue = "solo") String sort) {

        // ⭐ 2. 서비스 메소드에 sort 파라미터 전달
        Page<AccommodationResponseDto> accommodationsPage = accommodationService.getFilteredAccommodations(filters, pageable, sort);// Pageable 파라미터 추가
        return ResponseEntity.ok(accommodationsPage);
    }
}