package com.naon.home.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "photospot",
        indexes = {
            @Index(name="idx_photo_spot_category", columnList = "category"),
            @Index(name="idx_photo_spot_gugun", columnList = "gugun_nm")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoSpot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "spot_nm", nullable=false, unique = true, length = 255)
    private String spotNm;

    @Column(name = "photo_img", columnDefinition = "TEXT")
    private String photoImg;

    @Column(name = "detail_url", columnDefinition = "TEXT")
    private String detailUrl;

    @Column(name = "place_desc", columnDefinition = "TEXT")
    private String placeDesc;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name="gugun_nm", length=100)
    private String gugunNm;

    @Column(name = "lat", precision = 11, scale = 8)
    private BigDecimal lat;

    @Column(name = "lon", precision = 11, scale = 8)
    private BigDecimal lon;

    @Column(name="open_hours", length=255)
    private String openHours;

    @Column(name = "charge", length=255)
    private String charge;

    @Column(name = "rating", precision = 2, scale = 1)
    private BigDecimal rating;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "photospot_tag",
            joinColumns = @JoinColumn(name = "photospot_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"photospot_id", "tag_id"})
    )
    @Builder.Default
    private Set<Tag> tags = new LinkedHashSet<>();
}
