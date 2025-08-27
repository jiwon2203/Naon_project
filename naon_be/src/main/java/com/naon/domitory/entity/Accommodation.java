package com.naon.domitory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "accommodations")
public class Accommodation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    private String type;
    private String address;

    @Column(name = "station_info")
    private String stationInfo;

    @Column(name = "check_in")
    private LocalTime checkIn;

    @Column(name = "check_out")
    private LocalTime checkOut;

    private String rating;

    // private Integer price;  <-- 이 줄 삭제
    // private String icon;     <-- 이 줄 삭제

    @Column(name = "is_certified")
    private boolean isCertified;

    @Column(name = "is_24h_front")
    private boolean is24hFront;

    @Column(name = "is_non_smoking")
    private boolean isNonSmoking;

    @Column(name = "has_wifi")
    private boolean hasWifi;

    @Column(name = "is_gender_separated_restroom")
    private boolean isGenderSeparatedRestroom;

    @Column(name = "has_private_entrance")
    private boolean hasPrivateEntrance;

    @Column(name = "rating_score")
    private Double ratingScore;

    @Column(name = "solo_traveler_score")
    private Double soloTravelerScore;

    @Column(name = "image_file_name")
    private String imageFileName;

    // ⭐ 1. 페이지 URL 필드 추가
    @Column(name = "page_url")
    private String pageUrl;

    @OneToMany(mappedBy = "accommodation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AccommodationKeyword> keywords = new ArrayList<>();
}