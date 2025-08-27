import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Image,
  Linking, // ⭐ 1. Linking API import 추가
  Alert,   // ⭐ 1. 사용자에게 알림을 보여주기 위해 Alert 추가
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import api from '../api/api';
import { accommodationImages, defaultImage } from './assets/accommodationImages';

// 컴포넌트 및 스타일 import
import SafetyIndicator from '../components/common/SafetyIndicator';
import CustomButton from '../components/common/CustomButton';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/commonStyles';

// --- 실제 API 데이터와 일치시킨 상수 ---
const ACCOMMODATION_TYPES = {
  ALL: 'ALL',
  HOTEL: '호텔',
  GUESTHOUSE: '게스트하우스',
  PENSION: '펜션',
  MOTEL: '모텔',
};

const filterMap = {
  '24시간 프런트': '_24h_front',
  'Wifi': 'has_wifi',
  '남/녀화장실구분': '_gender_separated_restroom',
  '전용 출입구': 'has_private_entrance',
  '금연': '_non_smoking',
};

// --- 정렬 옵션 상수 추가 ---
const SORT_OPTIONS = {
  name: '가나다순',
  solo: '추천순',
  rating: '평점순',
};

const AccommodationScreen = ({ navigation }) => {
  // --- 상태 관리 ---
  const [accommodations, setAccommodations] = useState([]); // 현재 페이지의 숙소 목록 (10개)
  const [currentPage, setCurrentPage] = useState(0);       // 현재 페이지 번호 (0부터 시작)
  const [totalPages, setTotalPages] = useState(0);         // 전체 페이지 수
  const [totalElements, setTotalElements] = useState(0);   // 필터링된 전체 숙소 개수
  const [loading, setLoading] = useState(true);            // 로딩 상태
  const [error, setError] = useState(null);                // 에러 상태

  // 필터링 UI를 위한 상태
  const [activeType, setActiveType] = useState(ACCOMMODATION_TYPES.ALL);
  const [activeFilters, setActiveFilters] = useState([]);

  // --- 정렬 기능 상태 추가 ---
  const [sortOrder, setSortOrder] = useState('name'); // ⭐ 기본값을 'name' (가나다순)으로 변경
  const [isSortModalVisible, setSortModalVisible] = useState(false);


  // --- API 데이터 호출 ---
  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        // --- 정렬 파라미터 추가 ---
        params.append('sort', sortOrder);
        
        // 페이지네이션 파라미터
        params.append('page', currentPage);
        params.append('size', 10);

        // 필터링 파라미터
        if (activeType && activeType !== 'ALL') {
          params.append('type', activeType);
        }
        activeFilters.forEach(filter => {
          const dataKey = filterMap[filter];
          if (dataKey) {
            params.append(dataKey, 'true');
          }
        });

        //const response = await api.get(`/accommodations?${params.toString()}`);
        const response = await api.get(`api/accommodations?${params.toString()}`);
        
        setAccommodations(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setError(null);
      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, [activeType, activeFilters, currentPage, sortOrder]); // 필터나 페이지가 변경될 때마다 API 재호출


    // --- 핸들러 함수 ---
  const handleSortChange = (newSortOrder) => {
    if (sortOrder !== newSortOrder) {
      setSortOrder(newSortOrder);
      setCurrentPage(0); // 정렬 기준 변경 시 첫 페이지로 리셋
    }
    setSortModalVisible(false); // 모달 닫기
  };
  
  // --- 핸들러 함수 수정 ---
  const handleAccommodationPress = async (url) => {
    // ⭐ 2. URL 유효성 검사
    if (!url || typeof url !== 'string') {
      Alert.alert("오류", "유효하지 않은 URL입니다.");
      return;
    }

    // ⭐ 3. 해당 URL을 열 수 있는지 확인
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // ⭐ 4. URL 열기 (외부 브라우저 실행)
      await Linking.openURL(url);
    } else {
      Alert.alert("오류", `이 페이지를 열 수 없습니다: ${url}`);
    }
  };

  // --- 렌더링 함수들 ---
  // (이하 렌더링 관련 함수들은 이전과 동일)
  //const toggleFilter = (filter) => { setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]); };
  const renderStars = (ratingString) => {
    if (!ratingString) return null;
    const rating = parseFloat(ratingString.split('/')[0]);
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) { stars.push(<Icon key={i} name="star" size={12} color="#fbbf24" solid />); }
    if (hasHalfStar) { stars.push(<Icon key="half" name="star-half-alt" size={12} color="#fbbf24" solid />); }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) { stars.push(<Icon key={`empty-${i}`} name="star" size={12} color="#fbbf24" />); }
    return stars;
  };
  //const handleAccommodationPress = (accommodationName) => { navigation.navigate('AccommodationDetail', { name: accommodationName }); };

  const accommodationTabs = [
    { id: ACCOMMODATION_TYPES.ALL, label: '전체' },
    { id: ACCOMMODATION_TYPES.HOTEL, label: '호텔' },
    { id: ACCOMMODATION_TYPES.GUESTHOUSE, label: '게스트하우스' },
    { id: ACCOMMODATION_TYPES.PENSION, label: '펜션' },
    { id: ACCOMMODATION_TYPES.MOTEL, label: '모텔' },
  ];
  const filters = Object.keys(filterMap);

  // --- 렌더링 함수 수정 ---
  const renderContent = () => {
    if (loading) {
      return (<View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.infoText}>숙소 정보를 불러오는 중...</Text></View>);
    }
    if (error) {
      return (<View style={styles.centered}><Icon name="exclamation-circle" size={40} color={colors.danger} /><Text style={styles.infoText}>{error}</Text></View>);
    }
    if (accommodations.length === 0) {
      return (<View style={styles.centered}><Icon name="info-circle" size={40} color={colors.gray} /><Text style={styles.infoText}>조건에 맞는 숙소가 없습니다.</Text></View>);
    }
    
    return accommodations.map((accommodation) => {
      // ⭐ 숙소 이름으로 매칭되는 이미지 찾기
      console.log('API 응답:', accommodation.name, '->', accommodation.imageFileName);
      const imageSource = accommodation.imageFileName 
        ? accommodationImages[accommodation.imageFileName] 
        : defaultImage;

      // ⭐ 3. 매칭된 이미지 소스도 콘솔에 출력해서 확인
      if (!imageSource) {
        console.log('이미지 매칭 실패:', accommodation.imageFileName);
      }

      return (
        <TouchableOpacity
          key={accommodation.id}
          style={styles.accommodationCard}
          activeOpacity={0.8}
        >
          {/* ⭐ Image 컴포넌트 추가 */}
          <Image 
            source={imageSource || defaultImage} // 혹시 모를 오류 방지
            style={styles.accommodationImage} 
          />

          <View style={styles.accommodationInfo}>
            <View style={styles.accommodationHeader}>
              <View style={styles.accommodationTitleContainer}>
                <Text style={styles.accommodationName}>{accommodation.name}</Text>
                <Text style={styles.accommodationLocation}>{`${accommodation.address} ${accommodation.station_info ? ` · ${accommodation.station_info}` : ''}`}</Text>
              </View>
              {accommodation.certified && <SafetyIndicator level={'SAFE'} text="인증" />}
            </View>
            <View style={styles.ratingContainer}>{renderStars(accommodation.rating)}</View>
            <View style={styles.checkInOutContainer}>
              <View style={styles.checkInOutItem}><Icon name="sign-in-alt" size={14} color={colors.gray} /><Text style={styles.checkInOutText}>체크인 {accommodation.check_in}</Text></View>
              <View style={styles.checkInOutItem}><Icon name="sign-out-alt" size={14} color={colors.gray} /><Text style={styles.checkInOutText}>체크아웃 {accommodation.check_out}</Text></View>
            </View>
            <View style={styles.keywordsContainer}>
              {accommodation.keywords?.map((keyword) => (
                <View key={keyword} style={styles.keywordItem}>
                  <Icon name="hashtag" size={14} color={colors.gray} />
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
            <View style={styles.filterTagsContainer}>
              {Object.entries(filterMap).map(([displayText, dataKey]) => 
                accommodation[dataKey] ? (
                  <View key={displayText} style={styles.filterTag}>
                    <Text style={styles.filterTagText}>{displayText}</Text>
                  </View>
                ) : null
              )}
            </View>
            <View style={styles.priceContainer}>
              {/* ⭐ 5. '자세히 보기' 버튼의 onPress 이벤트를 수정 */}
              <CustomButton 
                title="자세히 보기" 
                size="small" 
                onPress={() => handleAccommodationPress(accommodation.pageUrl)} 
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  };
  
  // 페이지네이션 버튼 UI
  const renderPaginationControls = () => {
    if (loading || error || totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
          disabled={currentPage === 0}
          onPress={() => setCurrentPage(prev => prev - 1)}
        >
          <Text style={styles.paginationButtonText}>이전</Text>
        </TouchableOpacity>
        <Text style={styles.paginationInfoText}>{currentPage + 1} / {totalPages}</Text>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage >= totalPages - 1 && styles.paginationButtonDisabled]}
          disabled={currentPage >= totalPages - 1}
          onPress={() => setCurrentPage(prev => prev + 1)}
        >
          <Text style={styles.paginationButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>부산 추천 숙소</Text>
        </View>
        <View style={styles.accommodationTabs}>
          {accommodationTabs.map((tab) => (
            <TouchableOpacity key={tab.id} style={[styles.accommodationTab, activeType === tab.id && styles.accommodationTabActive]} onPress={() => { setCurrentPage(0); setActiveType(tab.id); }} activeOpacity={0.8}>
              <Text style={[styles.accommodationTabText, activeType === tab.id && styles.accommodationTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity key={filter} style={[commonStyles.filterChip, activeFilters.includes(filter) && commonStyles.filterChipActive]} onPress={() => { setCurrentPage(0); setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]); }} activeOpacity={0.8}>
              <Text style={[commonStyles.filterChipText, activeFilters.includes(filter) && commonStyles.filterChipTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.resultsHeader}>
          {/* <Text style={styles.resultsCount}>추천 숙소 총 {totalElements}곳</Text> */}
          <TouchableOpacity style={styles.sortContainer} onPress={() => setSortModalVisible(true)}>
            <Text style={styles.sortText}>{SORT_OPTIONS[sortOrder]}</Text>
            <Icon name="chevron-down" size={12} color={colors.gray} />
          </TouchableOpacity>
        </View>
      <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}> 
        {renderContent()}
        {renderPaginationControls()}
      
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setSortModalVisible(false)}>
          <View style={styles.modalContent}>
            {Object.entries(SORT_OPTIONS).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={styles.sortOptionButton}
                onPress={() => handleSortChange(key)}
              >
                <Text style={[styles.sortOptionText, sortOrder === key && styles.sortOptionTextActive]}>
                  {value}
                </Text>
                {sortOrder === key && <Icon name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// --- 스타일시트 ---
const styles = StyleSheet.create({
  // ... 기존 스타일 ...
  accommodationCard: { backgroundColor: colors.white, borderRadius: 12, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  // ⭐ 이미지 스타일 추가
  accommodationImage: {
    width: '100%',
    height: 200, // 이미지 높이는 원하는 대로 조절
  },
  accommodationInfo: { padding: 16 },
  header: { paddingHorizontal: 8, paddingVertical: 8 },
  title: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.darkGray },
  accommodationTabs: { flexDirection: 'row', backgroundColor: colors.secondary, borderRadius: 8, padding: 2, marginHorizontal: 8, marginBottom: 8 },
  accommodationTab: { flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  accommodationTabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  accommodationTabText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.gray },
  accommodationTabTextActive: { color: colors.primary },
  filterContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 16 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  resultsCount: { fontSize: typography.sizes.sm, color: colors.gray },
  sortContainer: { flexDirection: 'row', alignItems: 'center' },
  sortText: { fontSize: typography.sizes.sm, color: colors.gray, marginRight: 4 },
  accommodationCard: { backgroundColor: colors.white, borderRadius: 12, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  accommodationInfo: { padding: 16 },
  accommodationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  accommodationTitleContainer: { flex: 1, marginRight: 8 },
  accommodationName: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.darkGray },
  accommodationLocation: { fontSize: typography.sizes.sm, color: colors.gray, marginTop: 2 },
  ratingContainer: { flexDirection: 'row', marginBottom: 8 },
  checkInOutContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  checkInOutItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  checkInOutText: { fontSize: typography.sizes.sm, color: colors.gray, marginLeft: 6 },
  keywordsContainer: { marginBottom: 4, flexDirection: 'row', flexWrap: 'wrap' },
  keywordItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, marginRight: 16, },
  keywordText: { fontSize: typography.sizes.sm, color: colors.darkGray, marginLeft: 8, },
  filterTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 12, },
  filterTag: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 8, marginBottom: 8, },
  filterTagText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: '#0ea5e9', },
  priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, },
  priceInfo: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.darkGray },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50, },
  infoText: { marginTop: 16, fontSize: typography.sizes.md, color: colors.gray, },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, marginHorizontal: 16, },
  paginationButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, },
  paginationButtonDisabled: { backgroundColor: colors.gray, },
  paginationButtonText: { color: colors.white, fontWeight: 'bold', },
  paginationInfoText: { fontSize: typography.sizes.md, fontWeight: 'bold', color: colors.darkGray, marginHorizontal: 20, },

  // --- 모달 스타일 추가 ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  sortOptionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sortOptionText: {
    fontSize: typography.sizes.md,
    color: colors.darkGray,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});

export default AccommodationScreen;