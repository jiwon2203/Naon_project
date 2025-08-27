import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { commonStyles } from '../../styles/commonStyles';

const SafetyMap = () => {
  const mapMarkers = [
    { id: 1, type: 'cctv', icon: 'video', color: colors.primary, top: '15%', left: '25%', title: 'CCTV' },
    { id: 2, type: 'cctv', icon: 'video', color: colors.primary, top: '35%', right: '30%' },
    { id: 3, type: 'police', icon: 'shield-alt', color: colors.success, top: '45%', left: '15%', title: '경찰서' },
    { id: 4, type: 'light', icon: 'lightbulb', color: colors.warning, bottom: '25%', right: '20%', title: '가로등' },
    { id: 5, type: 'light', icon: 'lightbulb', color: colors.warning, top: '60%', left: '45%' },
    { id: 6, type: 'cctv', icon: 'video', color: colors.primary, bottom: '35%', left: '35%' },
    { id: 7, type: 'hospital', icon: 'hospital', color: colors.danger, top: '60%', left: '60%', title: '병원' },
  ];

  const filterChips = [
    { id: 1, icon: 'video', text: 'CCTV', active: true },
    { id: 2, icon: 'shield-alt', text: '경찰서', active: true },
    { id: 3, icon: 'lightbulb', text: '가로등', active: true },
    { id: 4, icon: 'hospital', text: '병원', active: true },
  ];

  const legendItems = [
    { color: colors.primary, text: 'CCTV 설치 구역' },
    { color: colors.success, text: '경찰서/파출소' },
    { color: colors.warning, text: '가로등 설치 구역' },
    { color: colors.danger, text: '병원' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Map Container */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Icon name="shield-alt" size={48} color={colors.gray} />
          <Text style={styles.mapTitle}>안전 지도</Text>
          <Text style={styles.mapSubtitle}>CCTV, 경찰서, 가로등, 병원 위치</Text>
        </View>
        
        {/* Map Markers */}
        {mapMarkers.map((marker) => (
          <View
            key={marker.id}
            style={[
              styles.mapMarker,
              { backgroundColor: marker.color },
              marker.top && { top: marker.top },
              marker.bottom && { bottom: marker.bottom },
              marker.left && { left: marker.left },
              marker.right && { right: marker.right },
            ]}
          >
            <Icon name={marker.icon} size={12} color={colors.white} />
          </View>
        ))}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {filterChips.map((chip) => (
          <View
            key={chip.id}
            style={[
              commonStyles.filterChip,
              chip.active && commonStyles.filterChipActive
            ]}
          >
            <Icon 
              name={chip.icon} 
              size={12} 
              color={chip.active ? colors.tags.blue.text : colors.darkGray}
              style={styles.chipIcon}
            />
            <Text style={[
              commonStyles.filterChipText,
              chip.active && commonStyles.filterChipTextActive
            ]}>
              {chip.text}
            </Text>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={commonStyles.card}>
        <Text style={styles.legendTitle}>안전도 범례</Text>
        {legendItems.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    margin: 16,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.gray,
    marginTop: 8,
  },
  mapSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    textAlign: 'center',
  },
  mapMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chipIcon: {
    marginRight: 4,
  },
  legendTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
  },
});

export default SafetyMap;