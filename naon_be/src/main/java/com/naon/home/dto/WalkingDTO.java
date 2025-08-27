package com.naon.home.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalkingDTO {
    private String title;   //MAIN_TITLE
    private String img;     //MAIN_IMG_THUMB
    private String desc;    //TITLE
    private double lat;     //LAT
    private double lon;     //LNG
    private String place;   //PLACE
    private Long detail;    //ITEMCNTNTS
    private Double distanceKm;
}
