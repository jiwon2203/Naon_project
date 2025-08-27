package com.naon.search.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantApiRequestDto {

    private String place_name; // 장소명
    private String place_url; // 장소 상세 페이지 url
    private String address_name; // 지번 주소
    private String longitude; // 경도
    private String latitude; // 위도

}
