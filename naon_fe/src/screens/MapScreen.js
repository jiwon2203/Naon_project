// src/screens/MapScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  NativeModules,
} from 'react-native';

import TmapView from '../native/TmapView.native';
//import { requireNativeComponent } from 'react-native';
//const TmapView = requireNativeComponent('TmapView');      // 두개 대신 위에 코드 사용

import RouteModal from '../components/modals/RouteModal';
import CustomButton from '../components/common/CustomButton';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/commonStyles';
import { MAP_MODES } from '../utils/constants';

import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

import points from '../assets/safety_busan_points_geocode.json';                // 경찰서 json 파일
import hospitals from '../assets/busan_hospitals.json';                         // 병원 json 파일
import streetlights from '../assets/suyeong_streetlights_by_region_10.json';    // 가로등 json 파일
import cctvRaw from '../assets/cctv_geocoded_tmap.cleaned.json';                // cctv json 파일


const { TmapModule } = NativeModules;
const RADIUS_M = 300;               // 경찰서
const STREETLIGHT_RADIUS = 500;     // 가로등
const STREETLIGHT_LIMIT  = 5;      // 가로등 개수 제한
const CCTV_RADIUS = 500;            // CCTV 반경
const CCTV_LIMIT  = 5;              // CCTV 개수 제한

if (!TmapModule) {
  console.warn('⚠️ TmapModule이 undefined입니다. 네이티브 모듈 연결을 확인하세요.');
}

// 하버사인 코드
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// 권한: 안드 12+ 대응
const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);
  const fine = result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
  const coarse = result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];
  const granted =
    fine === PermissionsAndroid.RESULTS.GRANTED ||
    coarse === PermissionsAndroid.RESULTS.GRANTED;
  if (!granted) {
    Alert.alert('권한 필요', '정확한 위치 권한을 허용해주세요.');
  }
  return granted;
};

const MapScreen = ({ navigation }) => {
  const [currentMode, setCurrentMode] = useState(MAP_MODES.SAFETY);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [tmapConfig, setTmapConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStartNavigation = () => {
    setShowRouteModal(false);
    navigation.navigate('Navigation');
  };

  // 위치 가져와서 지도 표시
  const initLocation = async () => {
    setLoading(true);
    try {
      const ok = await requestLocationPermission();
      if (!ok) return;

      await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          async ({ coords: { latitude, longitude } }) => {
            try {
              // (옵션) 서버로 위치 전송
              try {
                await axios.post('http://10.0.2.2:8080/api/location', {
                  latitude,
                  longitude,
                });
              } catch (e) {
                console.warn('백엔드 전송 오류:', e?.message);
              }

              // lat/lng 숫자화 + 반경 필터
              const nearby = points
                .map((p) => ({
                  ...p,
                  lat: Number.isFinite(p.lat) ? p.lat : parseFloat(p.lat),
                  lng: Number.isFinite(p.lng) ? p.lng : parseFloat(p.lng),
                }))
                .filter(
                  (p) =>
                    Number.isFinite(p.lat) &&
                    Number.isFinite(p.lng) &&
                    haversine(latitude, longitude, p.lat, p.lng) <= RADIUS_M
                );

                // 추가
                const hospitalsSrc = Array.isArray(hospitals)
                  ? hospitals
                  : (hospitals.data || hospitals.rows || hospitals.items || []);

                // 유틸: 숫자/문자 키 안전하게 꺼내기
                const pickNumber = (obj, keys) => {
                  for (const k of keys) {
                    if (obj?.[k] != null && obj[k] !== '') {
                      const n = parseFloat(String(obj[k]).replace(/,/g, '').trim());
                      if (Number.isFinite(n)) return n;
                    }
                  }
                  return NaN;
                };
                const pickString = (obj, keys) => {
                  for (const k of keys) if (obj?.[k]) return String(obj[k]);
                  return '';
                };

                const hospitalsAll = hospitalsSrc
                  .map((h) => ({
                    lat: pickNumber(h, ['lat', 'latitude', 'y', '위도']),
                    lng: pickNumber(h, ['lng', 'longitude', 'x', '경도']),
                    name: pickString(h, ['name', '의료기관명', '병원명']),
                    addr: pickString(h, ['addr', '도로명주소', 'address', '주소']),
                  }))
                  .filter((h) => Number.isFinite(h.lat) && Number.isFinite(h.lng));

                // 가로등 json 전부 표시
                // 파일의 좌표 키가 "위도"/"경도" :contentReference[oaicite:2]{index=2}
                const streetlightsSrc = Array.isArray(streetlights)
                  ? streetlights
                  : (streetlights.data || streetlights.rows || streetlights.items || []);

                const streetlightsAll = streetlightsSrc
                  .map((s) => ({
                    lat: pickNumber(s, ['lat', 'latitude', 'y', '위도']),
                    lng: pickNumber(s, ['lng', 'longitude', 'x', '경도']),
                    name: pickString(s, ['관리번호', '노선명', '등기구종류']),          // 표시용 타이틀 대체
                    addr: pickString(s, ['행정동', '소속분전함']),                    // 부제목 대체
                  }))
                  .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
                    .filter((s) => haversine(latitude, longitude, s.lat, s.lng) <= STREETLIGHT_RADIUS)
                    .slice(0, STREETLIGHT_LIMIT);

                // cctv 위치 표시
                const cctvSrc = Array.isArray(cctvRaw)
                 ? cctvRaw
                 : (cctvRaw.data || cctvRaw.rows || cctvRaw.items || []);

                const cctvs = cctvSrc
                  .map((c) => ({
                    lat: pickNumber(c, ['lat', 'latitude', 'y', '위도']),
                    lng: pickNumber(c, ['lng', 'longitude', 'x', '경도']),
                    name: pickString(c, ['CCTV 명칭', 'name', '명칭']),
                    // ‘지역’(구/군) + query(원문 주소) 중 있는 값 간단 합성
                    addr: [pickString(c, ['지역']), pickString(c, ['query'])].filter(Boolean).join(' · '),
                  }))
                  .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
                  .filter((c) => haversine(latitude, longitude, c.lat, c.lng) <= CCTV_RADIUS)
                  .slice(0, CCTV_LIMIT);

                // ===== 지도에 보낼 마커 합치기 =====
                const markers = [
                  // 기존 포인트(반경 필터 적용)
                  ...nearby.map((p) => ({
                    lat: p.lat,
                    lng: p.lng,
                    title: p.name || p.type || '지점',
                    subtitle: p.addr || '',
                    kind: p.type || '',
                  })),
                  // 병원 (전체)
                  ...hospitalsAll.map((h) => ({
                    lat: h.lat,
                    lng: h.lng,
                    title: h.name || '병원',
                    subtitle: h.addr || '',
                    kind: 'hospital',
                  })),
                  // 가로등 (전체)
                  ...streetlightsAll.map((s) => ({
                      lat: s.lat,
                      lng: s.lng,
                      title: s.name || '가로등',
                      subtitle: s.addr || '',
                      kind: 'streetlight',
                  })),
                  ...cctvs.map((c) => ({
                      lat: c.lat,
                      lng: c.lng,
                      title: c.name || 'CCTV',
                      subtitle: c.addr || '',
                      kind: 'cctv',
                  })),
                ];

                // 디버깅에 도움 (원하면 주석)
                console.log('nearby:', nearby.length, 'hospitals:', hospitalsAll.length, 'markers:', markers.length);

                setTmapConfig({
                    lat: latitude,
                    lng: longitude,
                    radius: RADIUS_M,
                    markers: JSON.stringify(markers),
                    //markers,
                });


              resolve(null);
            } catch (err) {
              reject(err);
            }
          },
          (err) => {
            // 에러 핸들링
            console.warn('Geolocation error:', err);
            Alert.alert('GPS 오류', err?.message ?? '현재 위치를 가져오지 못했습니다.');
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,                 // 더 여유 있게
            maximumAge: 0,                  // 캐시 금지 (항상 최신 요청)
            forceRequestLocation: true,     // 새 요청 강제
            showLocationDialog: true,       // GPS 꺼져 있으면 안내
          }
        );
      });
    } catch (error) {
      Alert.alert('GPS 오류', error?.message ?? '현재 위치를 가져오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initLocation();
  }, []);

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={[commonStyles.container, { flex: 1 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>지도</Text>
        </View>

        {/* Map Toggle */}
        <View style={styles.mapToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              currentMode === MAP_MODES.SAFETY && styles.toggleButtonActive,
            ]}
            onPress={() => setCurrentMode(MAP_MODES.SAFETY)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleButtonText,
                currentMode === MAP_MODES.SAFETY && styles.toggleButtonTextActive,
              ]}
            >
              안전 지도
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map Content - 카드 한 장 안에만 지도 렌더 */}
        {currentMode === MAP_MODES.SAFETY && (
          <View style={styles.mapCard}>
            {tmapConfig ? (
              <TmapView
                style={StyleSheet.absoluteFillObject}
                config={tmapConfig}
              />
            ) : (
              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapPlaceholderText}>
                  현재 위치 불러오는 중…
                </Text>
              </View>
            )}
          </View>
        )}

        {currentMode === MAP_MODES.CONVENIENCE && (
          <View style={styles.mapCard}>
            {/* 필요 시 편의시설용 config로 바꿔도 됨 */}
            <TmapView
              style={StyleSheet.absoluteFillObject}
              config={tmapConfig ?? {}}
            />
          </View>
        )}
      </View>

      {/* 필터칩 */}
      <View style={styles.filterRow}>
        <View style={[styles.chip, { backgroundColor: '#E8F0FF' }]}>
          <Text style={styles.chipText}>🟦 CCTV</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: '#E8F5EE' }]}>
          <Text style={styles.chipText}>🟩 경찰서</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: '#FFF2DB' }]}>
          <Text style={styles.chipText}>🟨 가로등</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: '#FFE8E8' }]}>
          <Text style={styles.chipText}>🟥 병원</Text>
        </View>
      </View>

      {/* 안전도 범례 카드 */}
      <View style={styles.legendCard}>
        <Text style={styles.legendTitle}>안전도 범례</Text>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>CCTV 설치 구역</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>경찰서/파출소</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>가로등 설치 구역</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>병원</Text>
        </View>
      </View>

      {/* Route Modal */}
      <RouteModal
        visible={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        onStartNavigation={handleStartNavigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    mapCard: {
        height: 400,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',                 // 라운드 밖 내용 자르기
        backgroundColor: '#E5E7EB',         // 회색 배경(로딩/빈화면 대비)
        position: 'relative',               // absoluteFillObject 기준
    },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
   mapPlaceholderText: { color: colors.gray },

//   범례 관련 스타일
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginHorizontal: 16,
        marginBottom: 12,
        flexWrap: 'wrap',
      },
      chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
      },
      chipText: {
        color: '#334155', fontWeight: '600',
      },
      legendCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 14,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      legendTitle: {
        fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#0f172a',
      },
      legendItem: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 8,
      },
      colorDot: {
        width: 12, height: 12, borderRadius: 6, marginRight: 8,
      },
      legendText: { color: '#334155' },

//  mapContainer: { flex: 1 },
//  tmapView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
  },
  mapToggle: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray,
  },
  toggleButtonTextActive: {
    color: colors.primary,
  },
  placeholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  placeholderText: { color: colors.gray },
  retryBtn: {
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: 8,
  },
  retryText: { color: colors.white, fontWeight: '600' },
});

export default MapScreen;