import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Geolocation from 'react-native-geolocation-service';

import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/commonStyles';
import { Image, PermissionsAndroid, Platform  } from 'react-native';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [text, setText] = useState('근처 맛집과 카페가 없습니다.');
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const filters = [
    { id: 'solo', label: '1인친화적' },
    { id: '24hours', label: '24시간운영' },
    { id: 'quiet', label: '조용한분위기' },
    { id: 'lively', label: '활기찬분위기' },
    { id: 'money', label: '가성비' },
    { id: 'hotplace', label: '유명한/핫플' },
  ];

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            (position) => {
              setLatitude(position.coords.latitude);
              setLongitude(position.coords.longitude);
            },
            (error) => {
              console.log("❌ 위치 오류:", error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
          );
        } else {
          console.log("❌ 위치 권한 거부됨");
          setText("위치 권한이 거부되었습니다.");
        }
      }
    };

    requestLocationPermission();
  }, []);

  const fetchRestaurants = async () => {
    try {
      if (latitude == '' && longitude == '') {
        setText("위치 정보를 가져오고 있습니다.")
        return;
      }

      // filters를 label 기준으로 백엔드에 넘김
      const selectedFilterLabels = activeFilters
        .map((id) => filters.find((f) => f.id === id)?.label)
        .filter(Boolean);

      const queryParams = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        keyword: searchQuery || '',
        filters: selectedFilterLabels.join(","),
      });

      const response = await fetch(`http://10.0.2.2:8080/search/restaurant?${queryParams}`);
      const json = await response.json();

      if (json.status === 200) {
        setSearchResults(json.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("❌ API 요청 실패:", error);
      setSearchResults([]);
    }
  };
  
  useEffect(() => {
    fetchRestaurants();
  }, [latitude, longitude, searchQuery, activeFilters]);

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={13} color="#fbbf24" solid />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half-alt" size={13} color="#fbbf24" solid />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star" size={13} color="#fbbf24" />
      );
    }

    return stars;
  };

  const getFirstSentence = (text) => {
    if (!text) {
      return '';
    }

    const sentenceEndIndex = text.search(/[.]/);

    if (sentenceEndIndex !== -1) {
      return text.substring(0, sentenceEndIndex + 1).trim();
    }

    return text.trim();
  };

  const handlePlacePress = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    } else {
      console.warn("URL not found for this place.");
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <TextInput
          style={commonStyles.searchBar}
          placeholder="맛집, 카페를 검색해보세요"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>필터</Text>
          <View style={styles.filterContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  commonStyles.filterChip,
                  activeFilters.includes(filter.id) && commonStyles.filterChipActive
                ]}
                onPress={() => toggleFilter(filter.id)}
                activeOpacity={0.8}
              >
                <Text style={[
                  commonStyles.filterChipText,
                  activeFilters.includes(filter.id) && commonStyles.filterChipTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>검색 결과</Text>
          <Text style={styles.resultsCount}>총 {searchResults.length}곳</Text>
        </View>

        {/* Search Results */}
        {searchResults.length === 0 ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: colors.gray, fontSize: 14 }}>
              {text}
            </Text>
          </View>
        ) : (
          searchResults.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.placeCard}
              onPress={() => handlePlacePress(place.url)}
              activeOpacity={0.8}
            >
              <View style={styles.placeImage}>
                <Image 
                  source={{ uri: place.image }} 
                  style={styles.imagePlaceholder}
                  resizeMode="cover"
                />           
              </View>

              <View style={styles.placeInfo}>
                <View style={styles.placeHeader}>
                  <Text style={styles.placeName}>{place.name}</Text>
                </View>
                
                <View style={styles.ratingContainer}>
                  <View style={styles.stars}>
                    {renderStars(place.rating)}
                  </View>
                  <Text style={styles.stars}>{place.rating}</Text>
                </View>
                
                <Text style={styles.placeDescription}>{getFirstSentence(place.description)}</Text>
                
                <View style={styles.placeDetail}>
                  <Icon name="clock" size={10} color={colors.gray} />
                  <Text style={styles.placeDetailText}>{place.hours}</Text>
                </View>
                
                <View style={styles.tagsContainer}>
                  {place.filters.map((tag, tagIndex) => (
                    <View key={tagIndex} style={[commonStyles.tag, styles.placeTag]}>
                      <Text style={[commonStyles.tagText, styles.placeTagText]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
  },
  resultsCount: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
  },
  placeCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  placeImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeInfo: {
    flex: 1,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  placeName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
  },
  placeDescription: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginBottom: 8,
  },
  placeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  placeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeDetailText: {
    fontSize: typography.sizes.xs,
    color: colors.gray,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  placeTag: {
    backgroundColor: colors.tags.blue.bg,
    marginRight: 4,
    marginBottom: 4,
  },
  placeTagText: {
    color: colors.tags.blue.text,
  },  
});

export default SearchScreen;