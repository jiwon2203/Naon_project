package com.naon.home.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TourDTO {
    private TourCategory tourCategory;
    private String title;            // MAIN_TITLE (괄호 안 글씨는 표시X)
    private String summary;          // TITLE (간단 설명)
    private String desc;              // ITEMCNTNTS (설명)
    private String district;         // GUGUN_NM (구군)
    private String place;            // PLACE
    private String addr;             // ADDR1
    private String phone;            // CNTCT_TEL
    private String homepage;         // HOMEPAGE_URL
    private Double lat;              // LAT
    private Double lng;              // LNG
    private String img;              // MAIN_IMG_THUMB
    private String open;             // USAGE_DAY_WEEK_AND_TIME
    private String fee;              // USAGE_AMOUNT (숫자 없으면 표시X)

    private Double distanceKm;       // Haversine 결과
    private List<String> tags;
}
