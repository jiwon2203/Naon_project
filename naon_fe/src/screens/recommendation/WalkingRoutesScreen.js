import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image, ActivityIndicator,
   RefreshControl, Alert, PermissionsAndroid, Platform,TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Geolocation from 'react-native-geolocation-service';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { commonStyles } from '../../styles/commonStyles';
import { DIFFICULTY_LEVELS } from '../../utils/constants';
import api from '../../api/api';

const CATEGORY_FILTERS = ['전체', '도심길', '해안길', '숲길', '강변길'];

const WalkingRoutesScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [routes, setRoutes] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageInput, setPageInput] = useState('');

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
        pos => {
          setUserLoc({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        err => {
          console.log('Geolocation error:', err);
        },
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
      params.append('page', String(pageNum));
      params.append('size', String(size));
      if (loc?.lat != null && loc?.lon != null) {
        params.append('userLat', String(loc.lat));
        params.append('userLon', String(loc.lon));
      }

      if (!category || category === '전체') {
        return `/walkingRoute?${params.toString()}`;
      }
      const type = category.replace('길', '');
      params.append('type', type);
      return `/walkingRoute/category?${params.toString()}`;
    },
    [size]
  );

  function cleanTitle(title) {
    if (!title) return '';
    return title.replace(/\(.*?\)/g, '').trim();
  }

  const fetchRoutes = useCallback(
    async (category, pageNum, loc) => {
      try {
        setLoading(true);
        const url = buildUrl(category, pageNum, loc);
        const res = await api.get(url);
        const data = res.data;

        const mapped = (Array.isArray(data) ? data : []).map((item, idx) => {
          const category = inferCategory(item);
          const difficulty = inferDifficulty(item);

          return {
            id: `${pageNum}-${idx}-${item.title ?? 'id'}`,
            name: cleanTitle(item.title) || '',
            image: item.img || null,
            desc: item.desc || '',
            lat: item.lat ?? 0,
            lon: item.lon ?? 0,
            place: item.place || '',
            category,
            difficulty,
            icon: inferIcon(item),
            tags: inferTags(item), 
            duration: '—',
            walkingTime: '—',
          };
        });

        setRoutes(mapped);
        setHasMore(mapped.length >= size);
      } catch (err) {
        console.error(err);
        Alert.alert('오류', '산책 코스를 불러오는 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [buildUrl, size]
  );

  useEffect(() => {
    setPage(1);
    fetchRoutes(activeFilter, 1, userLoc);
  }, [activeFilter, fetchRoutes, userLoc]);

  function inferCategory(item) {
    const t = `${item?.desc ?? ''} ${item?.title ?? ''} ${item?.place ?? ''}`;
    if (/해안|바다|해변|포구/.test(t)) return '해안길';
    if (/숲|수목원|자연|오솔길|산책로/.test(t)) return '숲길';
    if (/강변|하천|천변|강|교량|대교/.test(t)) return '강변길';
    return '도심길';
  }
  function inferTags(item) {
    const t = `${item?.desc ?? ''} ${item?.title ?? ''} ${item?.place ?? ''}`;
    const tags = [];
    if (/야경|저녁|밤|불빛|조명/.test(t)) tags.push('야경 명소');
    if (/바다|해안|해변|포구|항구/.test(t)) tags.push('바다 전망');
    if (/강|천|하천|강변|호수|호/.test(t)) tags.push('강변 산책');
    if (/숲|수목원|자연|수풀|나무|오솔길/.test(t)) tags.push('자연 경관');
    if (/도심|공원|광장|거리|시내/.test(t)) tags.push('도심 산책');
    if (/산책|둘레길|트레일|걷기/.test(t)) tags.push('산책 추천');
    if (/역사|문화|유적|사찰|성당/.test(t)) tags.push('역사·문화');
    if (/맛집|카페|식당|음식/.test(t)) tags.push('맛집 코스');
    if (/전망대|스카이|전망|뷰포인트/.test(t)) tags.push('전망 포인트');
    if (/꽃|벚꽃|단풍|식물원/.test(t)) tags.push('계절 명소');

    if (tags.length === 0) tags.push('산책 추천');
    return tags;
  }

  function inferDifficulty(item) {
    const t = `${item?.desc ?? ''} ${item?.title ?? ''} ${item?.place ?? ''}`;
    if (/가파른|급경사|암릉|산행|능선|등산|험한/.test(t)) return DIFFICULTY_LEVELS.HARD;
    if (/완만|평탄|산책|도심|도보|둘레/.test(t)) return DIFFICULTY_LEVELS.EASY;
    if (/해안|숲|강변|오솔길|트레일/.test(t)) return DIFFICULTY_LEVELS.MEDIUM;
    return DIFFICULTY_LEVELS.EASY;
  }

  function inferIcon(item) {
    const t = `${item?.desc ?? ''} ${item?.title ?? ''} ${item?.place ?? ''}`;
    if (/해안|바다|해변|포구/.test(t)) return 'water';
    if (/숲|수목원|자연|오솔길|산책로/.test(t)) return 'tree';
    if (/강변|하천|천변|교량|대교/.test(t)) return 'bridge';
    if (/도심|공원|광장|거리/.test(t)) return 'city';
    return 'walking';
  }

  // 난이도
  const difficultyLabel = (d) =>
    d === DIFFICULTY_LEVELS.HARD ? '어려움' :
    d === DIFFICULTY_LEVELS.MEDIUM ? '보통' : '쉬움';

  const difficultyMini = (d) => {
    if (d === DIFFICULTY_LEVELS.HARD)   return { bg: colors.safetyRed,    text: colors.safetyRedText,    icon: 'fire' };
    if (d === DIFFICULTY_LEVELS.MEDIUM) return { bg: colors.safetyYellow, text: colors.safetyYellowText, icon: 'mountain' };
    return { bg: colors.safetyGreen, text: colors.safetyGreenText, icon: 'leaf' };
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchRoutes(activeFilter, 1, userLoc);
  }, [activeFilter, fetchRoutes, userLoc]);

  const goPrev = useCallback(() => {
    if (loading) return;
    if (page <= 1) return;
    const next = page - 1;
    setPage(next);
    fetchRoutes(activeFilter, next, userLoc);
  }, [activeFilter, fetchRoutes, loading, page, userLoc]);

  const goNext = useCallback(() => {
    if (loading) return;
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchRoutes(activeFilter, next, userLoc);
  }, [activeFilter, fetchRoutes, hasMore, loading, page, userLoc]);

  const goToPage = useCallback((n) => {
    if (loading) return;
    if (!n || n < 1) return;
    setPage(n);
    fetchRoutes(activeFilter, n, userLoc);
  }, [activeFilter, fetchRoutes, loading, userLoc]);

  const filteredRoutes = useMemo(() => routes, [routes]);

  const handleRoutePress = (route) => {
    console.log('Show route:', route.name);
  };

  // 카테고리 색 + 태그 색
  const getTagStyle = (tag) => {
    if (tag.includes('도심길')) return colors.tags.yellow;
    if (tag.includes('해안길') || tag.includes('바다')) return colors.tags.blue;
    if (tag.includes('숲길') || tag.includes('자연')) return colors.tags.green;
    if (tag.includes('강변길')) return colors.tags.purple;

    if (tag.includes('도시')) return colors.tags.blue;
    if (tag.includes('평탄')) return colors.tags.green;
    if (tag.includes('야경') || tag.includes('저녁')) return colors.tags.purple;
    if (tag.includes('경사')) return colors.tags.orange;
    return colors.tags.yellow;
  };
  const pageNumbers = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = page + 2;
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page]);

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
          <Text style={styles.title}>산책 코스 추천</Text>
          <Text style={styles.subtitle}>
            총 {filteredRoutes.length}개 코스
            {!!userLoc && <Text style={{ color: colors.gray }}>{'  '}· 내 위치 기준</Text>}
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {CATEGORY_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                commonStyles.filterChip,
                activeFilter === filter && commonStyles.filterChipActive,
              ]}
              onPress={() => {
                setActiveFilter(filter);
                setPage(1);
                setPageInput(''); 
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  commonStyles.filterChipText,
                  activeFilter === filter && commonStyles.filterChipTextActive,
                ]}
              >
                {filter}
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

        {/* Walking Routes */}
        {!loading &&
          filteredRoutes.map((route) => {
            const dMini = difficultyMini(route.difficulty);
            const tags = [route.category, ...(route.tags ?? [])];

            return (
              <TouchableOpacity
                key={route.id}
                style={styles.routeCard}
                onPress={() => handleRoutePress(route)}
                activeOpacity={0.8}
              >
                <View style={styles.routeImage}>
                  {route.image ? (
                    <Image
                      source={{ uri: route.image }}
                      style={{ width: '100%', height: '100%', borderRadius: 8 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Icon name={route.icon} size={36} color={colors.gray} />
                  )}
                </View>

                <View style={styles.routeHeader}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <View style={[styles.miniBadge, { backgroundColor: dMini.bg }]}>
                    <Icon name={dMini.icon} size={9} color={dMini.text} />
                    <Text style={[styles.miniBadgeText, { color: dMini.text }]}>
                      {difficultyLabel(route.difficulty)}
                    </Text>
                  </View>
                </View>

                {!!route.desc && <Text style={styles.routeDescription}>{route.desc}</Text>}

                {/* 위치/거리 */}
                <View style={styles.routeStats}>
                  <View style={styles.routeStat}>
                    <Icon name="map-marker-alt" size={10} color={colors.gray} />
                    <Text style={styles.routeStatText}>
                      {route.place ? route.place : `${route.lat.toFixed(4)}, ${route.lon.toFixed(4)}`}
                    </Text>
                  </View>
                </View>

                {/* 태그 (카테고리 포함) */}
                {tags.length ? (
                  <View style={styles.tagsContainer}>
                    {tags.map((tag) => {
                      const tagStyle = getTagStyle(tag);
                      return (
                        <View key={`${route.id}-${tag}`} style={[styles.routeTag, { backgroundColor: tagStyle.bg }]}>
                          <Text style={[styles.routeTagText, { color: tagStyle.text }]}>#{tag}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}

        {/* 페이지 네비게이션 */}
        {!loading && (
          <View style={styles.pagerRow}>
            <View style={styles.numberRow}>
              {pageNumbers.map((n) => (
                <TouchableOpacity
                  key={`p-${n}`}
                  onPress={() => goToPage(n)}
                  style={[
                    styles.numBtn,
                    n === page && styles.numBtnActive
                  ]}
                >
                  <Text style={[
                    styles.numBtnText,
                    n === page && styles.numBtnTextActive
                  ]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  routeImage: {
    height: 120,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
    flex: 1,
    marginRight: 8,
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  miniBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginLeft: 4,
  },
  routeDescription: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginBottom: 12,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStatText: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  routeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  routeTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  pagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  numBtn: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  numBtnActive: {
    borderColor: colors.primary,
    backgroundColor: '#eef6ff',
  },
  numBtnText: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
  },
  numBtnTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  pagerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
    backgroundColor: colors.white,
  },
  pagerBtnDisabled: {
    borderColor: colors.gray,
  },
});

export default WalkingRoutesScreen;
