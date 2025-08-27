import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import CustomButton from '../common/CustomButton';

const RouteModal = ({ visible, onClose, onStartNavigation, destination = '' }) => {
  const [destinationInput, setDestinationInput] = useState(destination);
  const [showResults, setShowResults] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('safe');

  const routeOptions = [
    {
      id: 'safe',
      title: '안전 경로',
      subtitle: 'CCTV와 가로등이 많은 길',
      icon: 'shield-alt',
      color: colors.success,
      time: '12분',
      distance: '850m',
      features: [
        { icon: 'video', color: colors.primary, text: 'CCTV 8개' },
        { icon: 'lightbulb', color: colors.warning, text: '가로등 15개' },
        { icon: 'shield-alt', color: colors.success, text: '안전도 92%' },
      ],
    },
    {
      id: 'fast',
      title: '빠른 경로',
      subtitle: '최단 거리 경로',
      icon: 'bolt',
      color: colors.warning,
      time: '8분',
      distance: '620m',
      features: [
        { icon: 'video', color: colors.primary, text: 'CCTV 3개' },
        { icon: 'lightbulb', color: colors.warning, text: '가로등 8개' },
        { icon: 'exclamation-triangle', color: colors.warning, text: '안전도 74%' },
      ],
    },
  ];

  const handleFindRoute = () => {
    if (destinationInput.trim()) {
      setShowResults(true);
    } else {
      alert('목적지를 입력해주세요.');
    }
  };

  const handleStartNavigation = () => {
    onStartNavigation && onStartNavigation();
    onClose();
  };

  const handleClose = () => {
    setShowResults(false);
    setDestinationInput(destination);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>경로 찾기</Text>
          <TouchableOpacity onPress={handleClose}>
            <Icon name="times" size={20} color={colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="출발지"
              value="현재 위치"
              editable={false}
            />
            <TextInput
              style={styles.input}
              placeholder="목적지"
              value={destinationInput}
              onChangeText={setDestinationInput}
            />
          </View>

          <CustomButton
            title="경로 검색"
            onPress={handleFindRoute}
            style={styles.searchButton}
          />

          {showResults && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>추천 경로</Text>
              
              {routeOptions.map((route) => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.routeOption,
                    selectedRoute === route.id && styles.routeOptionSelected,
                    { borderLeftColor: route.color }
                  ]}
                  onPress={() => setSelectedRoute(route.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.routeHeader}>
                    <View style={styles.routeInfo}>
                      <View style={styles.routeTitleContainer}>
                        <Icon name={route.icon} size={16} color={route.color} />
                        <Text style={[styles.routeTitle, { color: route.color }]}>
                          {route.title}
                        </Text>
                      </View>
                      <Text style={styles.routeSubtitle}>{route.subtitle}</Text>
                    </View>
                    <View style={styles.routeStats}>
                      <Text style={styles.routeTime}>{route.time}</Text>
                      <Text style={styles.routeDistance}>{route.distance}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.routeFeatures}>
                    {route.features.map((feature, index) => (
                      <View key={index} style={styles.routeFeature}>
                        <Icon name={feature.icon} size={12} color={feature.color} />
                        <Text style={styles.routeFeatureText}>{feature.text}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}

              <View style={styles.buttonContainer}>
                <CustomButton
                  title="취소"
                  variant="secondary"
                  onPress={handleClose}
                  style={styles.cancelButton}
                />
                <CustomButton
                  title="길찾기 시작"
                  onPress={handleStartNavigation}
                  style={styles.startButton}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: typography.sizes.sm,
  },
  searchButton: {
    marginBottom: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
    marginBottom: 12,
  },
  routeOption: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  routeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routeInfo: {
    flex: 1,
  },
  routeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    marginLeft: 8,
  },
  routeSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
  },
  routeStats: {
    alignItems: 'flex-end',
  },
  routeTime: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
  },
  routeDistance: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
  },
  routeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  routeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  routeFeatureText: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  startButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default RouteModal;