package com.naon.domitory.service;

import com.naon.domitory.dto.AccommodationResponseDto;
import com.naon.domitory.entity.Accommodation;
import com.naon.domitory.repository.AccommodationRepository;
import com.naon.domitory.repository.AccommodationSpecs; // Specification 클래스 import
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification; // Specification import
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Map;
import org.springframework.data.domain.Page; // Page import
import org.springframework.data.domain.Pageable;


import java.util.Map;

@Service
@RequiredArgsConstructor
public class AccommodationService {

    private final AccommodationRepository accommodationRepository;

    @Transactional(readOnly = true)
    public Page<AccommodationResponseDto> getFilteredAccommodations(Map<String, String> filters, Pageable pageable, String sort) { // 반환 타입을 Page로 수정
        Specification<Accommodation> spec = (root, query, builder) -> builder.conjunction();

        // 2. 각 필터 조건에 따라 Specification 조합
        if (filters.containsKey("type")) {
            spec = spec.and(AccommodationSpecs.hasType(filters.get("type")));
        }
        if ("true".equals(filters.get("_24h_front"))) {
            spec = spec.and(AccommodationSpecs.is24hFront());
        }
        if ("true".equals(filters.get("has_wifi"))) {
            spec = spec.and(AccommodationSpecs.hasWifi());
        }
        if ("true".equals(filters.get("_non_smoking"))) {
            spec = spec.and(AccommodationSpecs.isNonSmoking());
        }
        if ("true".equals(filters.get("_gender_separated_restroom"))) {
            spec = spec.and(AccommodationSpecs.isGenderSeparatedRestroom());
        }
        if ("true".equals(filters.get("has_private_entrance"))) {
            spec = spec.and(AccommodationSpecs.hasPrivateEntrance());
        }

        // ⭐ 2. sort 값에 따라 실제 Entity 필드 이름으로 Sort 객체를 생성 (이 부분이 수정의 핵심)
        Sort sorting;
        switch (sort) {
            case "name":
                sorting = Sort.by(Sort.Direction.ASC, "name");
                break;
            case "rating":
                sorting = Sort.by(Sort.Direction.DESC, "ratingScore");
                break;
            case "solo":
            default: // 기본값 또는 "solo"일 경우
                sorting = Sort.by(Sort.Direction.DESC, "soloTravelerScore"); // "solo" -> "soloTravelerScore"
                break;
        }

        // 3. 페이지 정보와 정렬 정보를 합쳐 새로운 Pageable 객체 생성
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sorting);

        // 4. 필터와 정렬이 모두 적용된 Pageable 객체로 데이터 조회
        Page<Accommodation> accommodationPage = accommodationRepository.findAll(spec, sortedPageable);

        return accommodationPage.map(AccommodationResponseDto::fromEntity);
    }
}