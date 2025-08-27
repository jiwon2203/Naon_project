import React, { useState,  useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView,} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import WeatherCard from '../components/home/WeatherCard';
import RecommendationCard from '../components/home/RecommendationCard';
import QuickActions from '../components/home/QuickActions';
import ProfileDropdown from '../components/modals/ProfileDropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/commonStyles';

const HomeScreen = ({ navigation }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [user, setUser] = useState(null);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const storedUser = await AsyncStorage.getItem('user');
        if (alive) setUser (storedUser ? JSON.parse(storedUser) : null);
      })();
      return () => {alive = false;};
  }, [])
);

  const recommendations = [
    {
      id: 1,
      title: '산책 코스 추천',
      description: '날씨 맑음, 혼자 걷기 좋은 날이에요',
      icon: 'walking',
      color: colors.primary,
      backgroundColor: colors.tags.blue.bg,
      onPress: () => navigation.navigate('WalkingRoutes'),
    },
    {
      id: 2,
      title: '주변 가볼만한 장소 추천',
      description: '조용하고 혼자 있기 좋은 분위기',
      icon: 'map-marker-alt',
      color: colors.warning,
      backgroundColor: colors.tags.orange.bg,
      onPress: () => navigation.navigate('Attractions'),
    },
    {
      id: 3,
      title: '포토스팟 추천',
      description: '혼자 사진 찍기 좋은 명소',
      icon: 'camera',
      color: colors.tags.purple.text,
      backgroundColor: colors.tags.purple.bg,
      onPress: () => navigation.navigate('PhotoSpots'),
    },
  ];

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>안녕하세요, {user?.name || '여행자'}님</Text>
            <Text style={styles.subGreeting}>오늘도 안전한 혼행 되세요 ✨</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowProfileDropdown(!showProfileDropdown)}
            activeOpacity={0.8}
          >
            {user?.id ? (
              <Text style={styles.profileButtonText}>
                {(user?.name?.charAt(0) || user?.id?.charAt(0) || '?').toUpperCase()}
              </Text>
            ) : (
              <Icon name="user" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Weather Card */}
        <WeatherCard />

        {/* Today's Recommendations */}
        <View style={commonStyles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="star" size={18} color={colors.warning} solid />
            <Text style={[commonStyles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>
              오늘의 혼행 추천
            </Text>
          </View>
          
          {recommendations.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </View>

        {/* Quick Actions */}
        <QuickActions navigation={navigation} />
      </ScrollView>

      {/* Profile Dropdown */}
      <ProfileDropdown
        visible={showProfileDropdown}
        onClose={() => setShowProfileDropdown(false)}
        user={user}
        setUser={setUser}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
  },
  subGreeting: {
    fontSize: typography.sizes.base,
    color: colors.gray,
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
});

export default HomeScreen;