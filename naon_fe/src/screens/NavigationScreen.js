import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import CustomButton from '../components/common/CustomButton';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

const NavigationScreen = ({ navigation, route }) => {
  const [currentStep, setCurrentStep] = useState(2);
  const [remainingDistance, setRemainingDistance] = useState(150);
  const [estimatedTime, setEstimatedTime] = useState(2);
  const [safetyScore, setSafetyScore] = useState(92);

  const destination = route?.params?.destination || '조용한 북카페';

  const steps = [
    { id: 1, text: '현재 위치에서 출발', completed: true },
    { id: 2, text: '50m 직진 후 우회전', current: true },
    { id: 3, text: '해운대로를 따라 100m 직진', completed: false },
    { id: 4, text: '목적지 도착', completed: false },
  ];

  useEffect(() => {
    // Simulate navigation progress
    const timer = setTimeout(() => {
      navigation.navigate('Arrival', { destination });
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigation, destination]);

  const handleEndNavigation = () => {
    Alert.alert(
      '네비게이션 종료',
      '길찾기를 종료하시겠습니까?',
      [
        { text: '계속하기', style: 'cancel' },
        {
          text: '종료',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      '긴급상황 신고',
      '긴급상황 신고를 하시겠습니까?\n112(경찰) 또는 119(소방서)로 연결됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '신고하기',
          style: 'destructive',
          onPress: () => {
            Alert.alert('신고 완료', '긴급신고가 접수되었습니다.\n현재 위치가 자동으로 전송됩니다.');
          },
        },
      ]
    );
  };

  const handleRouteOptions = () => {
    Alert.alert('경로 변경', '경로 변경 옵션을 표시합니다.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={handleEndNavigation}>
          <Icon name="times" size={20} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.destinationText}>{destination}</Text>
          <Text style={styles.routeTypeText}>안전 경로로 안내 중</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('설정', '네비게이션 설정')}>
          <Icon name="cog" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Navigation Map */}
      <View style={styles.navigationMap}>
        <View style={styles.mapPlaceholder}>
          <Icon name="map" size={64} color="rgba(255,255,255,0.5)" />
          <Text style={styles.mapTitle}>실시간 경로 안내</Text>
          <Text style={styles.mapSubtitle}>GPS 위치 기반 네비게이션</Text>
        </View>

        {/* Route Elements */}
        <View style={[styles.routeLine, styles.routeLine1]} />
        <View style={[styles.routeLine, styles.routeLine2]} />
        
        <View style={styles.currentLocation} />
        <View style={styles.destinationMarker}>
          <Icon name="map-marker-alt" size={14} color={colors.white} />
        </View>

        {/* Safety Markers */}
        <View style={[styles.safetyMarker, styles.cctvMarker]}>
          <Icon name="video" size={10} color={colors.white} />
        </View>
        <View style={[styles.safetyMarker, styles.lightMarker]}>
          <Icon name="lightbulb" size={10} color={colors.white} />
        </View>
      </View>

      {/* Navigation Info */}
      <View style={styles.navigationInfo}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {remainingDistance}m
            </Text>
            <Text style={styles.statLabel}>남은 거리</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {estimatedTime}분
            </Text>
            <Text style={styles.statLabel}>예상 시간</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.tags.purple.text }]}>
              {safetyScore}%
            </Text>
            <Text style={styles.statLabel}>안전도</Text>
          </View>
        </View>

        {/* Current Direction */}
        <View style={styles.directionCard}>
          <View style={styles.directionHeader}>
            <View style={styles.directionIcon}>
              <Icon name="arrow-right" size={16} color={colors.white} />
            </View>
            <View style={styles.directionText}>
              <Text style={styles.directionTitle}>직진 후 우회전</Text>
              <Text style={styles.directionSubtitle}>
                50m 직진 후 해운대로에서 우회전하세요
              </Text>
            </View>
          </View>
        </View>

        {/* Safety Alert */}
        <View style={styles.safetyAlert}>
          <View style={styles.safetyAlertHeader}>
            <Icon name="shield-alt" size={16} color={colors.success} />
            <Text style={styles.safetyAlertTitle}>안전 구간</Text>
          </View>
          <Text style={styles.safetyAlertText}>
            • CCTV 2대 운영 중{'\n'}
            • 가로등 충분히 밝음{'\n'}
            • 보행자 통행량 많음
          </Text>
        </View>

        {/* Step Indicators */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>경로 안내</Text>
          {steps.map((step) => (
            <View key={step.id} style={styles.stepIndicator}>
              <View style={[
                styles.stepNumber,
                step.completed && styles.stepCompleted,
                step.current && styles.stepCurrent,
              ]}>
                <Text style={styles.stepNumberText}>{step.id}</Text>
              </View>
              <Text style={[
                styles.stepText,
                step.completed && styles.stepTextCompleted,
                step.current && styles.stepTextCurrent,
              ]}>
                {step.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Navigation Controls */}
        <View style={styles.navigationControls}>
          <CustomButton
            title="경로 변경"
            icon="route"
            variant="secondary"
            style={styles.controlButton}
            onPress={handleRouteOptions}
          />
          <CustomButton
            title="긴급 신고"
            icon="phone"
            variant="danger"
            style={styles.controlButton}
            onPress={handleEmergencyCall}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  navigationHeader: {
    backgroundColor: colors.black,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerCenter: {
    alignItems: 'center',
  },
  destinationText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  routeTypeText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: typography.sizes.sm,
  },
  navigationMap: {
    height: 400,
    backgroundColor: '#2d3748',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    alignItems: 'center',
  },
  mapTitle: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginTop: 16,
  },
  mapSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: typography.sizes.sm,
    marginTop: 4,
  },
  routeLine: {
    position: 'absolute',
    backgroundColor: colors.primary,
    borderRadius: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  routeLine1: {
    width: 4,
    height: 120,
    top: '30%',
    left: '20%',
    transform: [{ rotate: '45deg' }],
  },
  routeLine2: {
    width: 100,
    height: 4,
    top: '50%',
    left: '40%',
  },
  currentLocation: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: colors.success,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.white,
    top: '30%',
    left: '20%',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 5,
  },
  destinationMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: colors.danger,
    borderRadius: 15,
    borderTopRightRadius: 0,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    right: '25%',
  },
  safetyMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cctvMarker: {
    backgroundColor: colors.primary,
    top: '35%',
    left: '30%',
  },
  lightMarker: {
    backgroundColor: colors.warning,
    top: '45%',
    left: '50%',
  },
  navigationInfo: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
  },
  directionCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  directionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  directionIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  directionText: {
    flex: 1,
  },
  directionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
  },
  directionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
  },
  safetyAlert: {
    backgroundColor: colors.safetyGreen,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  safetyAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyAlertTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.safetyGreenText,
    marginLeft: 8,
  },
  safetyAlertText: {
    fontSize: typography.sizes.sm,
    color: colors.safetyGreenText,
  },
  stepsContainer: {
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
    marginBottom: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepCompleted: {
    backgroundColor: colors.gray,
  },
  stepCurrent: {
    backgroundColor: colors.success,
  },
  stepNumberText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  stepText: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    flex: 1,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
  },
  stepTextCurrent: {
    fontWeight: typography.weights.medium,
    color: colors.darkGray,
  },
  navigationControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
  },
});

export default NavigationScreen;