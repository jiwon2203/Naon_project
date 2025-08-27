package com.naon.home.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmergencyReportDTO {
    @NotBlank
    private String userId; // 회원 mid

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private Float accuracy;

    private String address;
}
