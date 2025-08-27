import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import CustomButton from '../components/common/CustomButton';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

const ArrivalScreen = ({ navigation, route }) => {
  const bounceValue = new Animated.Value(0);
  const destination = route?.params?.destination || '목적지';

  React.useEffect(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => bounce());
    };
    bounce();
  }, [bounceValue]);

  const handleGoHome = () => {
    navigation.navigate('MainTabs', {
      screen: 'Home',
      params: {
        screen: 'HomeMain',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ translateY: bounceValue }] }]}>
          <Icon name="check-circle" size={80} color={colors.white} />
        </Animated.View>
        
        <Text style={styles.title}>목적지에 도착했습니다!</Text>
        <Text style={styles.destination}>{destination}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>850m</Text>
              <Text style={styles.statLabel}>총 거리</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12분</Text>
              <Text style={styles.statLabel}>소요 시간</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>92%</Text>
              <Text style={styles.statLabel}>안전도</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <CustomButton
            title="홈으로 돌아가기"
            icon="home"
            variant="secondary"
            onPress={handleGoHome}
            style={[styles.button, styles.secondaryButton]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    backgroundColor: colors.success,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  destination: {
    fontSize: typography.sizes.xl,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 32,
  },
  statsContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.white,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

export default ArrivalScreen;