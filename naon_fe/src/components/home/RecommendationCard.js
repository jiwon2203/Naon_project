import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const RecommendationCard = ({ item }) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: item.backgroundColor }]}
      onPress={item.onPress}
      activeOpacity={0.8}
    >
      <Icon name={item.icon} size={20} color={item.color} />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.gray} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.darkGray,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginTop: 2,
  },
});

export default RecommendationCard;