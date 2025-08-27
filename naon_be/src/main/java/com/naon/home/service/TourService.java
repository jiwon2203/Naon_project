package com.naon.home.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naon.home.dto.TourCategory;
import com.naon.home.dto.TourDTO;
import com.naon.home.util.HttpUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourService {

    private static final String ATTRACTION_URL = "http://apis.data.go.kr/6260000/AttractionService/getAttractionKr";
    private static final String SHOPPING_URL   = "http://apis.data.go.kr/6260000/ShoppingService/getShoppingKr";

    @Value("${home.key}")
    private String apiKey; // 원키(raw). 여기서 직접 인코딩해 사용.

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<TourDTO> getTours(String category, int page, int size, Double userLat, Double userLon) {
        boolean wantAttraction = "전체".equals(category) || "명소".equals(category);
        boolean wantShopping   = "전체".equals(category) || "쇼핑".equals(category);

        List<TourDTO> result = new ArrayList<>();

        if (wantAttraction) {
            String url = buildUrl(ATTRACTION_URL, page, size);
            result.addAll(fetchAndMap(url, TourCategory.ATTRACTION, userLat, userLon));
        }
        if (wantShopping) {
            String url = buildUrl(SHOPPING_URL, page, size);
            result.addAll(fetchAndMap(url, TourCategory.SHOPPING, userLat, userLon));
        }

        // 가까운 순 정렬 (distanceKm != null 먼저)
        return result.stream()
                .sorted((a, b) -> {
                    Double A = a.getDistanceKm();
                    Double B = b.getDistanceKm();
                    if (A == null && B == null) return 0;
                    if (A == null) return 1;
                    if (B == null) return -1;
                    return Double.compare(A, B);
                })
                .collect(Collectors.toList());
    }

    private String buildUrl(String base, int page, int size) {
        String encodedKey = URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
        return UriComponentsBuilder.fromHttpUrl(base)
                .queryParam("serviceKey", encodedKey)
                .queryParam("pageNo", page)
                .queryParam("numOfRows", size)
                .queryParam("resultType", "json")
                .build(true)           // 이미 쿼리파라미터에 인코딩된 키를 넣었으므로 build(true)
                .toUriString();
    }

    private List<TourDTO> fetchAndMap(String url, TourCategory category, Double userLat, Double userLon) {
        try {
            String json = HttpUtils.simpleGet(url);

            // HTML(에러페이지) 가드
            if (json == null || json.isBlank() || json.trim().startsWith("<")) {
                // 필요 시 로그 남기기
                // log.warn("Non-JSON response from {}: {}", url, (json == null ? "null" : json.substring(0, Math.min(200, json.length()))));
                return List.of();
            }

            JsonNode root = objectMapper.readTree(json);

            // 응답 루트명은 getAttractionKr / getShoppingKr
            String rootKey = (category == TourCategory.ATTRACTION) ? "getAttractionKr" : "getShoppingKr";
            JsonNode itemsNode = root.has(rootKey) ? root.get(rootKey).get("item") : null;
            if (itemsNode == null && root.has("item")) itemsNode = root.get("item");
            if (itemsNode == null || itemsNode.isNull()) return List.of();

            List<JsonNode> nodes = new ArrayList<>();
            if (itemsNode.isArray()) itemsNode.forEach(nodes::add); else nodes.add(itemsNode);

            List<TourDTO> list = new ArrayList<>();
            for (JsonNode n : nodes) {
                String mainTitle  = getText(n, "MAIN_TITLE");
                String titleShort = getText(n, "TITLE");
                String district   = getText(n, "GUGUN_NM");
                String place      = getText(n, "PLACE");
                String addr      = getText(n, "ADDR1");
                String phone      = getText(n, "CNTCT_TEL");
                String homepage   = getText(n, "HOMEPAGE_URL");
                String imgThumb   = getText(n, "MAIN_IMG_THUMB");
                String openInfo   = getText(n, "USAGE_DAY_WEEK_AND_TIME");
                String feeRaw     = getText(n, "USAGE_AMOUNT");   // 숫자 없으면 표시X
                String content    = getText(n, "ITEMCNTNTS");
                Double lat        = getDouble(n, "LAT");
                Double lng        = getDouble(n, "LNG");

                String cleanTitle = cleanTitle(mainTitle);
                String fee = normalizeFee(feeRaw);

                // 거리 계산
                Double distKm = null;
                if (userLat != null && userLon != null && lat != null && lng != null) {
                    distKm = haversineKm(userLat, userLon, lat, lng);
                }

                // 태그 자동 추출
                List<String> tags = inferTags(titleShort, content);

                TourDTO dto = TourDTO.builder()
                        .tourCategory(category)
                        .title(cleanTitle)
                        .summary(titleShort)
                        .desc(content)
                        .district(district)
                        .place(place)
                        .addr(addr)
                        .phone(phone)
                        .homepage(homepage)
                        .lat(lat)
                        .lng(lng)
                        .img(imgThumb)
                        .open(openInfo)
                        .fee(fee)
                        .distanceKm(distKm)
                        .tags(tags)
                        .build();

                list.add(dto);
            }
            return list;

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private String getText(JsonNode node, String field) {
        return (node != null && node.hasNonNull(field)) ? node.get(field).asText() : null;
    }

    private Double getDouble(JsonNode node, String field) {
        try {
            if (node != null && node.hasNonNull(field)) {
                String v = node.get(field).asText();
                if (v != null && !v.isBlank()) return Double.parseDouble(v);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String cleanTitle(String title) {
        if (title == null) return null;
        return title.replaceAll("\\(.*?\\)", "").trim();
    }

    private String normalizeFee(String feeRaw) {
        if (feeRaw == null || feeRaw.isBlank()) return null;
        if (feeRaw.matches(".*\\d+.*"))   return feeRaw;
        return null;
    }

    // 태그 추론
    private List<String> inferTags(String... texts) {
        String t = Arrays.stream(texts).filter(Objects::nonNull).collect(Collectors.joining(" "));
        List<String> tags = new ArrayList<>();
        if (t.matches(".*(야경|저녁|밤|불빛|조명).*")) tags.add("야경 명소");
        if (t.matches(".*(바다|해안|해변|포구|항구).*")) tags.add("바다 전망");
        if (t.matches(".*(숲|수목원|자연|수풀|나무|오솔길).*")) tags.add("자연 경관");
        if (t.matches(".*(역사|문화|유적|사찰|성당).*")) tags.add("역사·문화");
        if (t.matches(".*(전망대|스카이).*")) tags.add("전망 포인트");
        if (t.matches(".*(벚꽃|단풍|식물원).*")) tags.add("계절 명소");
        if (t.matches(".*(시장).*")) tags.add("재래시장");
        if (t.matches(".*(백화점|아울렛).*")) tags.add("대형쇼핑몰");
        if (t.matches(".*(미술관).*")) tags.add("미술관");
        if (t.matches(".*(박물관).*")) tags.add("박물관");
        if (t.matches(".*(전시관).*")) tags.add("전시관");
        if (t.matches(".*(기념품|선물가게).*")) tags.add("선물가게");
        return tags;
    }

    // Haversine (km)
    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.asin(Math.sqrt(a));
        return R * c;
    }
}
