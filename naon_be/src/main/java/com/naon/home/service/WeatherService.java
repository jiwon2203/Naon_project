package com.naon.home.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naon.home.dto.WeatherDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class WeatherService {

    private static final String weatherURL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";

    @Value("${home.key}")
    private String weatherKey;

    public WeatherDTO fetchCurrentWeather(int nx, int ny) {
        try {
            BaseDateTime bdt = getUltraShortBaseDateTimeKST();

            String urlBuilder = weatherURL + "?" +
                    "serviceKey=" + URLEncoder.encode(weatherKey, "UTF-8") +
                    "&pageNo=1&numOfRows=1000&dataType=JSON" +
                    "&base_date=" + bdt.baseDate +
                    "&base_time=" + bdt.baseTime +
                    "&nx=" + nx +
                    "&ny=" + ny;

            URL url = new URL(urlBuilder);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(7000);
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            int code = conn.getResponseCode();
            BufferedReader rd = (code >= 200 && code <= 299)
                    ? new BufferedReader(new InputStreamReader(conn.getInputStream()))
                    : new BufferedReader(new InputStreamReader(conn.getErrorStream()));

            StringBuilder sb = new StringBuilder();
            for (String line; (line = rd.readLine()) != null; ) sb.append(line);
            rd.close();
            conn.disconnect();

            return parseWeatherData(sb.toString(), bdt);

        } catch (Exception e) {
            log.error("날씨 데이터 조회 실패: {}", e.getMessage(), e);
            return new WeatherDTO("N/A", "N/A", "알 수 없음", "알 수 없음");
        }
    }

    private BaseDateTime getUltraShortBaseDateTimeKST() {
        ZoneId KST = ZoneId.of("Asia/Seoul");
        ZonedDateTime now = ZonedDateTime.now(KST);

        int hour = now.getHour();
        int minute = now.getMinute();
        LocalDate date = now.toLocalDate();

        if (minute < 45) {
            hour -= 1;
            if (hour < 0) {
                hour = 23;
                date = date.minusDays(1);
            }
        }
        String baseDate = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String baseTime = String.format("%02d30", hour);
        return new BaseDateTime(baseDate, baseTime);
    }

    private WeatherDTO parseWeatherData(String json, BaseDateTime bdt) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);

        JsonNode res = root.path("response");
        if (res.isMissingNode() || !"00".equals(res.path("header").path("resultCode").asText())) {
            String msg = res.path("header").path("resultMsg").asText("API 실패/제한/오류");
            log.warn("기상청 API 응답 이상: {}", msg);
            return new WeatherDTO("N/A", "N/A", "알 수 없음", "알 수 없음");
        }

        JsonNode items = res.path("body").path("items").path("item");
        if (items.isMissingNode() || !items.isArray() || items.size() == 0) {
            log.warn("기상청 API: 항목 없음");
            return new WeatherDTO("N/A", "N/A", "알 수 없음", "알 수 없음");
        }
        String targetKeyTime = bdt.baseDate + bdt.baseTime;
        Map<String, ItemPick> latest = new HashMap<>();
        for (JsonNode item : items) {
            String cat = item.path("category").asText();  // T1H/REH/SKY/PTY
            String key = item.path("fcstDate").asText()+item.path("fcstTime").asText();
            String val = item.path("fcstValue").asText();

            ItemPick prev = latest.get(cat);
            if (prev == null) {
                latest.put(cat, new ItemPick(key, val));
                continue;
            }
            int cmpThis = key.compareTo(targetKeyTime);
            int cmpPrev = prev.keyTime.compareTo(targetKeyTime);

            boolean thisFuture = cmpThis >= 0;
            boolean prevFuture = cmpPrev >= 0;

            boolean take;
            if (thisFuture && prevFuture){
                take = key.compareTo(prev.keyTime) < 0;
            } else if (!thisFuture && !prevFuture){
                take = key.compareTo(prev.keyTime) > 0;
            } else {
                take = thisFuture;
            }
            if (take) latest.put(cat, new ItemPick(key, val));
        }

        String temperature = formatOrNA(latest.get("T1H"), "°C");
        String humidity    = formatOrNA(latest.get("REH"), "%");
        String ptyCode = safeValue(latest.get("PTY"));
        String skyText = "알 수 없음";
        if (!ptyCode.isBlank() && !"0".equals(ptyCode)){
            skyText = translatePty(ptyCode);
        } else {
            skyText = translateSky(safeValue(latest.get("SKY")));
        }
        String ptyText = translatePty(ptyCode.isBlank() ? "0" : ptyCode);

        return new WeatherDTO(temperature, humidity, skyText, ptyText);
    }

    private String formatOrNA(ItemPick pick, String unit) {
        if (pick == null || pick.value == null || pick.value.isBlank()) return "N/A";
        return pick.value + unit;
    }
    private String safeValue(ItemPick pick) {
        return (pick == null || pick.value == null) ? "" : pick.value;
    }

    private String translateSky(String code) {
        return switch (code) {
            case "1" -> "☀ 맑음";
            case "3" -> "🌥 구름 많음";
            case "4" -> "☁ 흐림";
            default -> "알 수 없음";
        };
    }

    private String translatePty(String code) {
        return switch (code) {
            case "0" -> "강수 없음";
            case "1" -> "🌧 비";
            case "2" -> "🌨 비/눈";
            case "3" -> "❄ 눈";
            case "4" -> "🌦 소나기";
            default -> "알 수 없음";
        };
    }

    private record BaseDateTime(String baseDate, String baseTime) {}
    private static class ItemPick {
        final String keyTime; // fcstDate+fcstTime
        final String value;
        ItemPick(String keyTime, String value) { this.keyTime = keyTime; this.value = value; }
    }
}