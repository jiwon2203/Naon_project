// AttractionsScreen.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Geolocation from 'react-native-geolocation-service';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { commonStyles } from '../../styles/commonStyles';
import api from '../../api/api';

const FILTERS = ['전체', '명소', '쇼핑'];

const AttractionsScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(15);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [lastKnownPage, setLastKnownPage] = useState(1);
  const [lastPage, setLastPage] = useState(null);

  const [userLoc, setUserLoc] = useState(null); // { lat, lon }

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const getCurrentPosition = useCallback(async () => {
    try {
      const ok = await requestLocationPermission();
      if (!ok) return;
      Geolocation.getCurrentPosition(
        pos => setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => console.log('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  const buildUrl = useCallback(
    (category, pageNum, loc) => {
      const params = new URLSearchParams();
      params.append('category', category);
      params.append('page', String(pageNum));
      params.append('size', String(size));
      if (loc?.lat != null && loc?.lon != null) {
        params.append('userLat', String(loc.lat));
        params.append('userLon', String(loc.lon));
      }
      return `/tour?${params.toString()}`;
    },
    [size]
  );

  const cleanTitle = (title) => (title ? title.replace(/\(.*?\)/g, '').trim() : '');

  // 아이콘 추론(카테고리/태그/요약/설명)
  const inferIcon = (dto) => {
    const t = `${dto?.tourCategory ?? ''} ${(dto?.tags || []).join(' ')} ${dto?.summary ?? ''} ${dto?.desc ?? ''}`;
    if (/쇼핑|시장|백화점|몰|상가/.test(t) || /SHOPPING/i.test(dto?.tourCategory)) return 'shopping-bag';
    if (/(바다|해안|해변|포구|항구)/.test(t)) return 'water';
    if (/(하천|강변|호수|호|교량|대교)/.test(t)) return 'bridge';
    if (/(숲|자연|수목원|오솔길|산책로|산|공원)/.test(t)) return 'tree';
    if (/(역사|문화|사찰|성당|유적|박물관|미술|전시|기념관)/.test(t)) return 'landmark';
    if (/(전망대|뷰|야경|야경 명소)/.test(t)) return 'binoculars';
    if (/(기념품|선물가게)/.test(t)) return 'gift';
    return 'map-marker-alt';
  };

  const getTagStyle = (tag) => {
    switch (tag) {
      case '야경 명소': return colors.tags.orange;
      case '바다 전망': return colors.tags.blue;
      case '자연 경관': return colors.tags.green;
      case '역사·문화': return colors.tags.purple;
      case '전망 포인트': return colors.tags.orange;
      case '계절 명소': return colors.tags.green;
      case '재래시장': return colors.tags.yellow;
      case '대형쇼핑몰': return colors.tags.yellow;
      case '미술관': return colors.tags.purple;
      case '박물관': return colors.tags.purple;
      case '전시관': return colors.tags.purple;
      case '선물가게': return colors.tags.yellow;
      default: return colors.tags.yellow;
    }
  };

  // 데이터 요청
  const fetchItems = useCallback(
    async (category, pageNum, loc) => {
      try {
        setLoading(true);
        const url = buildUrl(category, pageNum, loc);
        const res = await api.get(url);
        const data = Array.isArray(res.data) ? res.data : [];

        // 백엔드 TourDTO → 프론트 아이템 매핑
        const mapped = data.map((d, idx) => {
          const item = {
            id: `${category}-${pageNum}-${idx}-${d.title ?? 'id'}`,
            name: cleanTitle(d.title) || '',
            summary: d.summary || '',
            desc: d.desc || '',
            district: d.district || '',
            place: d.place || '',
            addr: d.addr || '',
            phone: d.phone || '',
            img: d.img || null,
            open: d.open || '',            // 운영 시간
            fee: d.fee || null,            // 없으면 null
            lat: d.lat ?? 0,
            lon: d.lng ?? 0,               // ⚠️ 백엔드 필드명 lng
            tags: Array.isArray(d.tags) ? d.tags : [],
            tourCategory: d.tourCategory,  // 'ATTRACTION' | 'SHOPPING'
          };
          return { ...item, icon: inferIcon(item) };
        });

        setItems(mapped);

        const more = mapped.length >= size;
        setHasMore(more);

        if (pageNum > lastKnownPage) setLastKnownPage(pageNum);
        if (!more) setLastPage(pageNum);
        else if (lastPage && pageNum === lastPage) setLastPage(null);
      } catch (err) {
        console.error(err);
        Alert.alert('오류', '관광 데이터를 불러오는 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [buildUrl, size, lastKnownPage, lastPage]
  );

  useEffect(() => {
    setPage(1);
    setLastKnownPage(1);
    setLastPage(null);
    fetchItems(activeFilter, 1, userLoc);
  }, [activeFilter, fetchItems, userLoc]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setLastKnownPage(1);
    setLastPage(null);
    fetchItems(activeFilter, 1, userLoc);
  }, [activeFilter, fetchItems, userLoc]);

  const goPrev = useCallback(() => {
    if (loading || page <= 1) return;
    const next = page - 1;
    setPage(next);
    fetchItems(activeFilter, next, userLoc);
  }, [activeFilter, fetchItems, loading, page, userLoc]);

  const goNext = useCallback(() => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchItems(activeFilter, next, userLoc);
  }, [activeFilter, fetchItems, hasMore, loading, page, userLoc]);

  const goToPage = useCallback((n) => {
    if (loading) return;
    const maxPage = lastPage ?? lastKnownPage;
    if (!n || n < 1 || n > maxPage) return;
    setPage(n);
    fetchItems(activeFilter, n, userLoc);
  }, [activeFilter, fetchItems, loading, userLoc, lastKnownPage, lastPage]);

  const pageNumbers = useMemo(() => {
    const max = lastPage ?? lastKnownPage;
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [lastKnownPage, lastPage]);

  const handlePress = (item) => {
    console.log('Open detail:', item.name);
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={commonStyles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="arrow-left" size={16} color={colors.primary} />
          <Text style={commonStyles.backButtonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>가볼만한 장소</Text>
          <Text style={styles.subtitle}>
            총 {items.length}곳 {!!userLoc && <Text style={{ color: colors.gray }}>{' · 내 위치 기준'}</Text>}
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[commonStyles.filterChip, activeFilter === f && commonStyles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text
                style={[commonStyles.filterChipText, activeFilter === f && commonStyles.filterChipTextActive]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading */}
        {loading && (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8, color: colors.gray }}>불러오는 중…</Text>
          </View>
        )}

        {/* List */}
        {!loading && items.map((it) => {
          const showPrice = !!it.fee;
          const categoryLabel = it.tourCategory === 'SHOPPING' ? '쇼핑' : '명소';

          return (
            <TouchableOpacity
              key={it.id}
              style={styles.card}
              onPress={() => handlePress(it)}
              activeOpacity={0.8}
            >
              <View style={styles.imageBox}>
                {it.img ? (
                  <Image
                    source={{ uri: it.img }}
                    style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Icon name={it.icon} size={36} color={colors.gray} />
                )}
              </View>

              {/* 타이틀 + 카테고리 배지 */}
              <View style={styles.rowBetween}>
                <Text style={styles.name}>{it.name}</Text>
                <View style={styles.catBadge}>
                  <Icon name={it.tourCategory === 'SHOPPING' ? 'shopping-bag' : 'landmark'} size={10} color={colors.primary} />
                  <Text style={styles.catBadgeText}>{categoryLabel}</Text>
                </View>
              </View>

              {/* 요약 */}
              {!!it.summary && <Text style={styles.desc}>{it.summary}</Text>}

              {/* 상세 설명(2줄 정도) */}
              {!!it.desc && <Text style={styles.longDesc} numberOfLines={2}>{it.desc}</Text>}

              {/* 지역/장소 배지 */}
              <View style={styles.badgeRow}>
                {!!it.district && (
                  <View style={styles.smallBadge}>
                    <Icon name="map" size={10} color={colors.primary} />
                    <Text style={styles.smallBadgeText}>{it.district}</Text>
                  </View>
                )}
                {!!it.place && (
                  <View style={styles.smallBadge}>
                    <Icon name="map-pin" size={10} color={colors.primary} />
                    <Text style={styles.smallBadgeText}>{it.place}</Text>
                  </View>
                )}
              </View>

              {/* 메타: 주소 / 시간 / 요금 / 전화 */}
              <View style={styles.metaRow}>
                {!!it.addr && (
                  <View style={styles.metaItem}>
                    <Icon name="map-marker-alt" size={10} color={colors.gray} />
                    <Text style={styles.metaText}>{it.addr}</Text>
                  </View>
                )}
              </View>
              <View style={styles.metaRow}>
                {!!it.open && (
                  <View style={styles.metaItem}>
                    <Icon name="clock" size={10} color={colors.gray} />
                    <Text style={styles.metaText}>{it.open}</Text>
                  </View>
                )}
                {showPrice && (
                  <View style={styles.metaItem}>
                    <Icon name="won-sign" size={10} color={colors.gray} />
                    <Text style={styles.metaText}>{it.fee}</Text>
                  </View>
                )}
                {!!it.phone && (
                  <View style={styles.metaItem}>
                    <Icon name="phone" size={10} color={colors.gray} />
                    <Text style={styles.metaText}>{it.phone}</Text>
                  </View>
                )}
              </View>

              {/* 태그 */}
              {!!it.tags?.length && (
                <View style={styles.tagsWrap}>
                  {it.tags.map((tag) => {
                    const s = getTagStyle(tag);
                    return (
                      <View key={`${it.id}-${tag}`} style={[styles.tag, { backgroundColor: s.bg }]}>
                        <Text style={[styles.tagText, { color: s.text }]}>#{tag}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Pager */}
        {!loading && (
          <View style={styles.pagerRow}>
            <TouchableOpacity
              onPress={goPrev}
              disabled={page <= 1}
              style={[styles.pagerBtn, page <= 1 && styles.pagerBtnDisabled]}
            >
              <Icon name="chevron-left" size={12} color={page <= 1 ? colors.gray : colors.primary} />
              <Text style={[styles.pagerText, { color: page <= 1 ? colors.gray : colors.primary }]}>이전</Text>
            </TouchableOpacity>

            <View style={styles.numberRow}>
              {pageNumbers.map((n) => (
                <TouchableOpacity
                  key={`p-${n}`}
                  onPress={() => goToPage(n)}
                  style={[styles.numBtn, n === page && styles.numBtnActive]}
                >
                  <Text style={[styles.numBtnText, n === page && styles.numBtnTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={goNext}
              disabled={!hasMore}
              style={[styles.pagerBtn, !hasMore && styles.pagerBtnDisabled]}
            >
              <Text style={[styles.pagerText, { color: !hasMore ? colors.gray : colors.primary }]}>다음</Text>
              <Icon name="chevron-right" size={12} color={!hasMore ? colors.gray : colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  title: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.darkGray },
  subtitle: { fontSize: typography.sizes.sm, color: colors.gray },
  filterContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 16 },

  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  imageBox: { height: 120, backgroundColor: colors.lightGray, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.darkGray, flex: 1, marginRight: 8 },

  catBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#eef6ff', gap: 4 },
  catBadgeText: { fontSize: typography.sizes.xs, color: colors.primary, fontWeight: typography.weights.semibold },

  desc: { fontSize: typography.sizes.sm, color: colors.gray, marginBottom: 6 },
  longDesc: { fontSize: typography.sizes.sm, color: colors.darkGray, marginBottom: 10 },

  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  smallBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#eef6ff' },
  smallBadgeText: { fontSize: typography.sizes.xs, color: colors.primary, fontWeight: typography.weights.semibold },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: typography.sizes.sm, color: colors.gray, marginLeft: 4 },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 4, marginBottom: 4 },
  tagText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },

  // Pager
  pagerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginVertical: 12 },
  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numBtn: { minWidth: 34, height: 30, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.lightGray, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  numBtnActive: { borderColor: colors.primary, backgroundColor: '#eef6ff' },
  numBtnText: { fontSize: typography.sizes.sm, color: colors.darkGray },
  numBtnTextActive: { color: colors.primary, fontWeight: typography.weights.semibold },
  pagerBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, gap: 6, backgroundColor: colors.white },
  pagerBtnDisabled: { borderColor: colors.gray },
  pagerText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
});

export default AttractionsScreen;
