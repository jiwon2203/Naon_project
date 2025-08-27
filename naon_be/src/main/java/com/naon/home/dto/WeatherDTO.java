package com.naon.home.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WeatherDTO {
    private String temperature;
    private String humidity;
    private String sky;             // 맑음, 흐림
    private String precipitation;   // 비, 없음
}
