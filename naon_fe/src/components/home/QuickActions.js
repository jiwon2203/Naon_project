import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { commonStyles } from '../../styles/commonStyles';

const QuickActions = ({ navigation }) => {
  const actions = [
    {
      id: 1,
      title: '근처 맛집',
      icon: 'map-marker-alt',
      color: colors.primary,
      onPress: () => navigation.navigate('Search'),
    },
    {
      id: 2,
      title: '숙소 찾기',
      icon: 'bed',
      color: colors.success,
      onPress: () => navigation.navigate('Accommodation'),
    },
    {
      id: 3,
      title: '안전 경로',
      icon: 'route',
      color: '#8b5cf6',
      onPress: () => {
        // TODO: 라우트 모달 표시
        console.log('Show route modal');
      },
    },
  ];

  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.sectionTitle}>빠른 접근</Text>
      <View style={styles.actionsContainer}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            <Icon name={action.icon} size={20} color={action.color} />
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default QuickActions;