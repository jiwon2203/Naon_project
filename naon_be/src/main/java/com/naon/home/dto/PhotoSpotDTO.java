package com.naon.home.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoSpotDTO {
    private Long id;
    private String spotNm;
    private String photoImg;
    private String detailUrl;
    private String placeDesc;
    private String category;
    private String gugunNm;
    private BigDecimal lat;
    private BigDecimal lon;
    private List<String> tags;
    private String openHours;
    private String charge;
    private BigDecimal rating;
}
