import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { SAFETY_LEVELS } from '../../utils/constants';

const SafetyIndicator = ({ level, text }) => {
  const getIndicatorStyle = () => {
    switch (level) {
      case SAFETY_LEVELS.SAFE:
        return {
          backgroundColor: colors.safetyGreen,
          textColor: colors.safetyGreenText,
          icon: 'shield-alt',
        };
      case SAFETY_LEVELS.WARNING:
        return {
          backgroundColor: colors.safetyYellow,
          textColor: colors.safetyYellowText,
          icon: 'exclamation-triangle',
        };
      case SAFETY_LEVELS.DANGER:
        return {
          backgroundColor: colors.safetyRed,
          textColor: colors.safetyRedText,
          icon: 'exclamation-triangle',
        };
      default:
        return {
          backgroundColor: colors.safetyGreen,
          textColor: colors.safetyGreenText,
          icon: 'shield-alt',
        };
    }
  };

  const indicatorStyle = getIndicatorStyle();

  return (
    <View style={[styles.container, { backgroundColor: indicatorStyle.backgroundColor }]}>
      <Icon 
        name={indicatorStyle.icon} 
        size={10} 
        color={indicatorStyle.textColor} 
        style={styles.icon}
      />
      <Text style={[styles.text, { color: indicatorStyle.textColor }]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});

export default SafetyIndicator;