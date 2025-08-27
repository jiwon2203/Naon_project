package com.naon.domitory.dto;

import com.naon.domitory.entity.Accommodation;
import com.naon.domitory.entity.AccommodationKeyword;
import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class AccommodationResponseDto {

    private Integer id;
    private String name;
    private String type;
    private String address;
    private String station_info;
    private String check_in;
    private String check_out;
    private String rating;
    private Double ratingScore;
    private Integer price;
    private String icon;
    private boolean is_certified;
    private boolean is_24h_front;
    private boolean is_non_smoking;
    private boolean has_wifi;
    private boolean is_gender_separated_restroom;
    private boolean has_private_entrance;
    private Double soloTravelerScore;
    private String imageFileName;
    private String pageUrl;
    private List<String> keywords;


    // Entity 객체를 DTO 객체로 변환하는 static 메서드
    public static AccommodationResponseDto fromEntity(Accommodation accommodation) {
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        return AccommodationResponseDto.builder()
                .id(accommodation.getId())
                .name(accommodation.getName())
                .type(accommodation.getType())
                .address(accommodation.getAddress())
                .station_info(accommodation.getStationInfo())
                .check_in(accommodation.getCheckIn() != null ? accommodation.getCheckIn().format(timeFormatter) : null)
                .check_out(accommodation.getCheckOut() != null ? accommodation.getCheckOut().format(timeFormatter) : null)
                .rating(accommodation.getRating())
                .ratingScore(accommodation.getRatingScore())
                .is_certified(accommodation.isCertified())
                .is_24h_front(accommodation.is24hFront())
                .is_non_smoking(accommodation.isNonSmoking())
                .has_wifi(accommodation.isHasWifi())
                .is_gender_separated_restroom(accommodation.isGenderSeparatedRestroom())
                .has_private_entrance(accommodation.isHasPrivateEntrance())
                .soloTravelerScore(accommodation.getSoloTravelerScore())
                .imageFileName(accommodation.getImageFileName())
                .pageUrl(accommodation.getPageUrl())
                .keywords(accommodation.getKeywords().stream()
                        .map(AccommodationKeyword::getKeyword)
                        .collect(Collectors.toList()))
                .build();
    }
}