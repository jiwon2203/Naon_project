import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { commonStyles } from '../../styles/commonStyles';

const ConvenienceMap = () => {
  const mapMarkers = [
    { id: 1, type: 'convenience', icon: 'store', color: '#8b5cf6', top: '20%', left: '30%', title: '편의점' },
    { id: 2, type: 'toilet', icon: 'restroom', color: '#06b6d4', top: '40%', right: '25%', title: '공중화장실' },
    { id: 3, type: 'pharmacy', icon: 'pills', color: colors.danger, top: '50%', left: '20%', title: '약국' },
    { id: 4, type: 'convenience', icon: 'store', color: '#8b5cf6', bottom: '30%', right: '35%' },
    { id: 5, type: 'toilet', icon: 'restroom', color: '#06b6d4', top: '65%', left: '50%' },
    { id: 6, type: 'pharmacy', icon: 'pills', color: colors.danger, bottom: '40%', left: '40%' },
    { id: 7, type: 'locker', icon: 'box-open', color: colors.darkGray, top: '55%', left: '75%', title: '물품보관함' },
  ];

  const filterChips = [
    { id: 1, icon: 'restroom', text: '화장실', active: true },
    { id: 2, icon: 'store', text: '편의점', active: true },
    { id: 3, icon: 'pills', text: '약국', active: true },
    { id: 4, icon: 'box-open', text: '물품보관함', active: true },
  ];

  const legendItems = [
    { color: '#06b6d4', text: '공중화장실' },
    { color: '#8b5cf6', text: '편의점' },
    { color: colors.danger, text: '약국' },
    { color: colors.darkGray, text: '물품보관함' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Map Container */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Icon name="store" size={48} color={colors.gray} />
          <Text style={styles.mapTitle}>편의시설 지도</Text>
          <Text style={styles.mapSubtitle}>화장실, 편의점, 약국, 물품보관함 위치</Text>
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
        <Text style={styles.legendTitle}>편의시설 범례</Text>
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

export default ConvenienceMap;