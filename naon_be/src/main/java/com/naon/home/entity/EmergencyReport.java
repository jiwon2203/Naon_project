package com.naon.home.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mid")
    private Member member;

    private Double latitude;
    private Double longitude;
    private Float accuracy;

    @Column(length = 255)
    private String address;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
