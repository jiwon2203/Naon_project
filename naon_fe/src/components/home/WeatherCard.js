import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, PermissionsAndroid, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { commonStyles } from '../../styles/commonStyles';
import Geolocation from 'react-native-geolocation-service';
import api from '../../api/api';
import { GeocodeKakao } from '../../api/GeocodeKakao';

const DEFAULT_COORDS = { lat: 35.157574, lon: 129.125340 };

const WeatherCard = () => {
  const [regionText, setRegionText] = useState('위치 확인 중...');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const safetyFeatures = [
    { icon: 'video', color: colors.primary, text: 'CCTV 5개' },
    { icon: 'shield-alt', color: colors.success, text: '경찰서 200m' },
  ];

  useEffect(() => { fetchWeather(); }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const res = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,

      ]);
      const fine =
        res[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
      const coarse =
        res[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
      return fine || coarse;
    } else {
      // iOS는 실제 권한 요청 필요
      try {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        return auth === 'granted';
      } catch {
        return false;
      }
    }
  };
  const fetchWeather = async () => {
    setLoading(true);
    try {
      const ok = await requestPermission();
      if (!ok) {
        setRegionText('위치 권한이 필요합니다');
        setLoading(false);
        return;
      }
      Geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          // setRegionText(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
          // setRegionText('부산 수영구');
          try {
            const r = await GeocodeKakao(latitude, longitude);
            setRegionText(r.compact);
          } catch {
            setRegionText('현재 위치');
          }

          try {
            const { data } = await api.get('/api/weather/current', {
              params: { lat: latitude, lon: longitude },
              timeout: 7000,
            });
            setWeather(data);
          } catch (err) {
            console.warn('Weather API error:', err?.message || err);
            setWeather({
              temperature: 'N/A',
              humidity: 'N/A',
              sky: '알 수 없음',
              precipitation: '알 수 없음',
            });
          } finally {
            setLoading(false);
          }
        },
        async (err) => {
        console.warn('Geolocation error:', err);
        setRegionText('현재 위치 (기본값 적용)');

        // ✅ fallback: 기본 좌표로 날씨 가져오기
        try {
          const { data } = await api.get('/api/weather/current', {
            params: { lat: DEFAULT_COORDS.lat, lon: DEFAULT_COORDS.lon },
            timeout: 7000,
          });
          setWeather(data);
        } catch (err2) {
          console.warn('Fallback Weather API error:', err2?.message || err2);
          setWeather({
            temperature: 'N/A',
            humidity: 'N/A',
            sky: '알 수 없음',
            precipitation: '알 수 없음',
          });
        } finally {
          setLoading(false);
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000,
        forceLocationManager: true, showLocationDialog: true,
       }
    );
    } catch (e) {
      console.warn('Init error:', e);
      setRegionText('초기화 실패');
      setLoading(false);
    }
  };

  const pickIconName = () => {
    const s = weather?.sky || '';
    const p = weather?.precipitation || '';
    if (p.includes('비/눈') || p.includes('소나기')) return 'cloud-showers-heavy';
    if (p.includes('눈')) return 'snowflake';
    if (p.includes('비')) return 'cloud-rain';
    if (s.includes('흐림')) return 'cloud';
    if (s.includes('구름')) return 'cloud-sun';
    if (s.includes('맑음')) return 'sun';
    return 'cloud';
  };

  return (
    <View style={[commonStyles.gradientCard, styles.weatherCard]}>
      <View style={styles.weatherHeader}>
        <View style={styles.weatherInfo}>
          <Text style={styles.weatherTitle}>현재 위치 날씨</Text>
          <Text style={styles.location}>{regionText}</Text>
        </View>
        <View style={styles.weatherDisplay}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Icon name={pickIconName()} size={40} color={colors.primary} />
              <Text style={styles.temperature}>{weather?.temperature ?? 'N/A'}</Text>
              <Text style={styles.weatherStatus}>{weather?.sky ?? '알 수 없음'}</Text>
              <Text style={styles.humidity}>습도 {weather?.humidity ?? 'N/A'}</Text>
            </>
          )}
        </View>
      </View>
      
      <View style={styles.safetyInfo}>
        {safetyFeatures.map((feature, index) => (
          <View key={index} style={styles.safetyItem}>
            <Icon name={feature.icon} size={14} color={feature.color} />
            <Text style={styles.safetyText}>{feature.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weatherCard: {
    backgroundColor: colors.white,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
  },
  location: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginTop: 4,
  },
  weatherDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  temperature: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    marginTop: 4,
  },
  weatherStatus: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
  },
  humidity: {
    fontSize: typography.sizes.xs,
    color: colors.gray,
  },
  safetyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyText: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginLeft: 4,
  },
});

export default WeatherCard;