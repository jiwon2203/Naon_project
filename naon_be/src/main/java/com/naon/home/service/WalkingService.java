package com.naon.home.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naon.home.dto.WalkingDTO;
import com.naon.home.util.HttpUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalkingService {
    private static final String walkingURL = "http://apis.data.go.kr/6260000/WalkingService/getWalkingKr";

    @Value("${home.key}")
    private String walkingkey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 전체 페이지
    public List<WalkingDTO> getAll(int page, int size, Double userLat, Double userLon){
        String url = buildUrl(page, size);
        return fetchAndMap(url, null, userLat, userLon);
    }

    // 카테고리: 해안/숲/강변/도심
    public List<WalkingDTO> getByCategory(String category, int page, int size, Double userLat, Double userLon) {
        String url = buildUrl(page, size);
        String keyword = normalizeCategoryKeyword(category); // "해안", "숲", "강변", "도심"
        return fetchAndMap(url, keyword, userLat, userLon);
    }

    private String buildUrl(int page, int size) {
        String encodedKey = URLEncoder.encode(walkingkey, StandardCharsets.UTF_8);

        return UriComponentsBuilder.fromHttpUrl(walkingURL)
                .queryParam("serviceKey", encodedKey)
                .queryParam("pageNo", page)
                .queryParam("numOfRows", size)
                .queryParam("resultType", "json")
                .build(true)
                .toUriString();
    }
    private List<WalkingDTO> fetchAndMap(String url, String containsKeyword, Double userLat, Double userLon) {
        try {
            String json = HttpUtils.simpleGet(url);
            JsonNode root = objectMapper.readTree(json);

            JsonNode itemsNode = null;
            if (root.has("getWalkingKr")) {
                itemsNode = root.get("getWalkingKr").get("item");
            }
            if (itemsNode == null && root.has("item")) {
                itemsNode = root.get("item");
            }
            if (itemsNode == null || itemsNode.isNull()) {
                return List.of();
            }

            List<JsonNode> nodes = new ArrayList<>();
            if (itemsNode.isArray()) itemsNode.forEach(nodes::add);
            else nodes.add(itemsNode);

            String kwLower = containsKeyword == null ? null : containsKeyword.toLowerCase(Locale.ROOT);

            List<WalkingDTO> list = new ArrayList<>();
            for (JsonNode n : nodes) {
                String mainTitle  = getText(n, "MAIN_TITLE");
                String imgThumb   = getText(n, "MAIN_IMG_THUMB");
                String title2     = getText(n, "TITLE");
                String place      = getText(n, "PLACE");
                String itemCntnts = getText(n, "ITEMCNTNTS");
                double lat        = getDouble(n, "LAT");
                double lon        = getDouble(n, "LNG");

                // 카테고리 키워드 필터 (ITEMCNTNTS 기준)
                if (kwLower != null && !kwLower.isBlank()) {
                    String haystack = (itemCntnts == null ? "" : itemCntnts).toLowerCase(Locale.ROOT);
                    if (!haystack.contains(kwLower)) continue;
                }

                // 거리 계산
                Double distKm = null;
                if (userLat != null && userLon != null && lat != 0.0 && lon != 0.0) {
                    distKm = haversineKm(userLat, userLon, lat, lon);
                }

                WalkingDTO dto = WalkingDTO.builder()
                        .title(mainTitle)
                        .img(imgThumb)
                        .desc(title2)
                        .lat(lat)
                        .lon(lon)
                        .place(place)
                        .distanceKm(distKm)
                        .build();

                list.add(dto);
            }

            // 가까운 순 정렬 (거리 null은 뒤로)
            return list.stream()
                    .sorted((a, b) -> {
                        Double A = a.getDistanceKm();
                        Double B = b.getDistanceKm();
                        if (A == null && B == null) return 0;
                        if (A == null) return 1;
                        if (B == null) return -1;
                        return Double.compare(A, B);
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private String normalizeCategoryKeyword(String category) {
        if (category == null) return null;
        // 입력이 "해안길/숲길/강변길/도심길"이어도 포함 키워드는 "해안/숲/강변/도심"
        String c = category.replace("길", "").trim();
        if (c.contains("해안")) return "해안";
        if (c.contains("숲"))   return "숲";
        if (c.contains("강변")) return "강변";
        if (c.contains("도심")) return "도심";
        // 예상 외 입력은 그대로 필터 키워드로 사용
        return c;
    }
    private String getText(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : null;
        // 일부 필드는 값이 " " 또는 빈 문자열일 수 있음
    }

    private double getDouble(JsonNode node, String field) {
        try {
            if (node.hasNonNull(field)) {
                return Double.parseDouble(node.get(field).asText());
            }
        } catch (Exception ignored) {}
        return 0.0;
    }

    private Long tryParseLong(String s) {
        try {
            if (s == null) return null;
            return Long.parseLong(s.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.asin(Math.sqrt(a));
        return R * c;
    }
}