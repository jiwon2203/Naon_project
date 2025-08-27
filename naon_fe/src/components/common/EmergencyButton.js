// src/components/home/EmergencyButton.js
import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity, StyleSheet, Alert, Animated, Easing,
  Platform, PermissionsAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/api';
import { GeocodeKakao } from '../../api/GeocodeKakao';
import { colors } from '../../styles/colors';
import { SCREEN_NAMES } from '../../utils/constants'; // 로그인 라우트명

const EmergencyButton = () => {
  const navigation = useNavigation();
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 1.05, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]).start(pulse);
    };
    pulse();
  }, [scaleValue]);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const res = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      const fine = res[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
      const coarse = res[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
      return fine || coarse;
    }
    const auth = await Geolocation.requestAuthorization('whenInUse');
    return auth === 'granted';
  };

  const sendReport = async ({ latitude, longitude, accuracy }) => {
    // ⛔️ 로그아웃 상태 처리
    const rawUser = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('token');

    if (!rawUser || !token) {
      Alert.alert(
        '로그인이 필요합니다',
        '긴급 신고를 서버에 저장하려면 로그인하세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '로그인 이동', onPress: () => navigation.navigate(SCREEN_NAMES.LOGIN) },
        ]
      );
      return;
    }

    const user = JSON.parse(rawUser);

    // ✅ 역지오코딩(주소/행정동) 추가
    let address = '현재 위치';
    try {
      const r = await GeocodeKakao(latitude, longitude);
      address = r?.compact || r?.address_name || address;
    } catch { /* 주소 실패 시 기본값 유지 */ }

    // 서버 저장
    await api.post('/api/emergency/report', {
      userId: user.id,
      latitude,
      longitude,
      accuracy,
      address,
    }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    Alert.alert('신고 완료', '긴급신고가 접수되었고, 현재 위치가 전송되었습니다.');
  };

  const handleEmergency = () => {
    Alert.alert(
      '긴급상황 신고',
      '긴급 신고를 하시겠습니까?\n현재 위치와 사용자 정보가 서버에 저장됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '신고하기',
          style: 'destructive',
          onPress: async () => {
            const ok = await requestPermission();
            if (!ok) return Alert.alert('권한 필요', '위치 권한을 허용해주세요.');

            Geolocation.getCurrentPosition(
              async ({ coords }) => {
                try {
                  await sendReport(coords); // { latitude, longitude, accuracy }
                } catch (e) {
                  console.warn('emergency report error:', e?.message || e);
                  Alert.alert('오류', '신고 중 문제가 발생했습니다.');
                }
              },
              (err) => {
                console.warn('Geolocation error:', err?.code, err?.message);
                Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                forceRequestLocation: true,
                showLocationDialog: true,
              }
            );
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity style={styles.button} onPress={handleEmergency}>
        <Icon name="exclamation" size={20} color={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 110, right: 20, zIndex: 99 },
  button: {
    width: 50, height: 50, borderRadius: 30, backgroundColor: colors.danger,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
});

export default EmergencyButton;
