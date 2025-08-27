import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { commonStyles } from '../../styles/commonStyles';
import Geolocation from 'react-native-geolocation-service';
import api from '../../api/api';


const DEFAULT_LIMIT = 10;
const DEFAULT_COORDS = { lat: 35.157574, lon: 129.125340 }; // 기본 좌표() - 위치 권한 거부 시 사용
const CATEGORY_FILTERS = ['전체', '자연', '문화', '이색여행'];

const PhotoSpotsScreen = ({ navigation }) => {
  const [coord, setCoord] = useState(DEFAULT_COORDS);
  const [category, setCategory] = useState('전체'); // 단일 선택
  const [spots, setSpots] = useState([]);

  const distanceKm = (lat1, lon1, lat2, lon2) => {
    if (lat2 == null || lon2 == null) return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const transportInfo = (dto) => {
    const d = distanceKm(coord.lat, coord.lon, dto.lat, dto.lon);
    if (d != null && d < 1) {
      return { icon: 'walking', label: '도보' };
    }
    return { icon: 'bus', label: '대중교통' };
  };

  const toUI = (dto) => {
    const { icon, label } = transportInfo(dto);
    return {
      id: dto.id,
      name: dto.spotNm,
      photoImg: dto.photoImg,
      description: dto.placeDesc,
      category: dto.category,
      gugunNm: dto.gugunNm,
      hours: dto.openHours || '정보 없음',
      charge: dto.charge || '',
      rating: dto.rating ?? 0,
      tags: Array.isArray(dto.tags) ? dto.tags : [],
      lat: dto.lat,
      lon: dto.lon,
      transportIcon: icon,
      transportLabel: label,
    };
  };

  useEffect(() => {
    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords || {};
        if (latitude && longitude) {
          setCoord({ lat: latitude, lon: longitude });
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        let res;
        if (category === '전체') {
          res = await api.get('/photospots/all', {
            params: { lat: coord.lat, lon: coord.lon, limit: DEFAULT_LIMIT },
          });
        } else {
          res = await api.get('/photospots/category', {params: { category },});
        }
        setSpots((res.data || []).map(toUI));
      } catch {
        setSpots([]);
      }
    };
    load();
  }, [category, coord.lat, coord.lon]);

  const onTagPress = async (tag) => {
    try {
      const res = await api.get('/photospots/tag', { params: { tag } });
      setCategory('전체'); // 태그 결과는 '전체'로 간주
      setSpots((res.data || []).map(toUI));
    } catch {
      setSpots([]);
    }
  };


  const handlePhotoSpotPress = (name) => {
    // navigation.navigate('PhotoSpotDetail', { name });
  };

  const getTagStyle = () => ({ bg: '#eef2ff', text: '#1f3ed1' });

  const renderStars = (rating) => {
    const r = Number(rating ?? 0);
    const stars = [];
    const full = Math.floor(r);
    const half = r % 1 !== 0;

    for (let i = 0; i < full; i++) {
      stars.push(<Icon key={`f-${i}`} name="star" size={12} color="#fbbf24" solid />);
    }
    if (half) {
      stars.push(<Icon key="half" name="star-half-alt" size={12} color="#fbbf24" solid />);
    }
    for (let i = 0; i < 5 - Math.ceil(r); i++) {
      stars.push(<Icon key={`e-${i}`} name="star" size={12} color="#fbbf24" />);
    }
    return <View style={{ flexDirection: 'row', columnGap: 4 }}>{stars}</View>;
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.title}>포토스팟 추천</Text>
          <Text style={styles.subtitle}>총 {spots.length}곳</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {CATEGORY_FILTERS.map((item) => {
            const active = category === item;
            return (
              <TouchableOpacity
                key={item}
                style={[
                  commonStyles.filterChip,
                  active && commonStyles.filterChipActive,
                ]}
                onPress={() => setCategory(item)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    commonStyles.filterChipText,
                    active && commonStyles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Photo Spots */}
        {spots.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={styles.photoSpotCard}
            onPress={() => handlePhotoSpotPress(spot.name)}
            activeOpacity={0.8}
          >
            {!!spot.photoImg && (
              <View style={styles.photoSpotImage}>
                <Image
                  source={{ uri: spot.photoImg }}
                  style={{ width: '100%', height: '100%', borderRadius: 8 }}
                />
              </View>
            )}
            
            <View style={styles.photoSpotHeader}>
              <Text style={styles.photoSpotName}>{spot.name}</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              {renderStars(spot.rating)}
              <Text style={styles.ratingText}>
                {typeof spot.rating === 'number' ? spot.rating.toFixed(1) : '0.0'}
              </Text>
            </View>
            
            <Text style={styles.photoSpotDescription}>{spot.description}</Text>
            
            <View style={styles.photoSpotDetails}>
              <View style={styles.photoSpotDetail}>
                <Icon name={spot.transportIcon} size={10} color={colors.gray} />
                <Text style={styles.photoSpotDetailText}>{spot.transportLabel}</Text>
              </View>
              <View style={styles.photoSpotDetail}>
                <Icon name="clock" size={10} color={colors.gray} />
                <Text style={styles.photoSpotDetailText}>{spot.hours}</Text>
              </View>
            </View>
            
            {/**태그 */}
            {Array.isArray(spot.tags) && spot.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {spot.tags.map((tag) => {
                  const {bg, text} = getTagStyle(tag);
                  return (
                    <TouchableOpacity key={tag} style={[styles.photoSpotTag, { backgroundColor: bg }]}
                    onPress={() => onTagPress(tag)}>
                      <Text style={[styles.photoSpotTagText, { color: text }]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            </TouchableOpacity>
        ))}
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
  photoSpotCard: {
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
  photoSpotImage: {
    height: 120,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoSpotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  photoSpotName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginLeft: 4,
  },
  photoSpotDescription: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginBottom: 12,
  },
  photoSpotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoSpotDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoSpotDetailText: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoSpotTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  photoSpotTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});

export default PhotoSpotsScreen;