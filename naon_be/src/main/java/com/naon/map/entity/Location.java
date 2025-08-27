package com.naon.map.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor          // 기본 생성자 자동 생성
@AllArgsConstructor         // 모든 필드를 포함한 생성자 자동 생성
@Entity
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double latitude;
    private double longitude;
    private LocalDateTime timestamp;

    // 생성자, getter, setter
//    public Location() {}
//
//    public Location(double latitude, double longitude, LocalDateTime timestamp) {
//        this.latitude = latitude;
//        this.longitude = longitude;
//        this.timestamp = timestamp;
//    }
//
//    // Getters & Setters
//    // 🔹 setter 추가
//    public void setTimestamp(LocalDateTime timestamp) {
//        this.timestamp = timestamp;
//    }
//
//    public LocalDateTime getTimestamp() {
//        return this.timestamp;
//    }
}