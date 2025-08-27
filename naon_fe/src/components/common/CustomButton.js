import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const CustomButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  icon, 
  size = 'medium',
  disabled = false,
  style 
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    };

    // Size styles
    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 12 },
      medium: { paddingVertical: 12, paddingHorizontal: 20 },
      large: { paddingVertical: 16, paddingHorizontal: 24 },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? colors.lightGray : colors.primary,
      },
      secondary: {
        backgroundColor: disabled ? colors.lightGray : colors.secondary,
      },
      danger: {
        backgroundColor: disabled ? colors.lightGray : colors.danger,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = () => {
    const variantTextStyles = {
      primary: { color: disabled ? colors.gray : colors.white },
      secondary: { color: disabled ? colors.gray : colors.darkGray },
      danger: { color: disabled ? colors.gray : colors.white },
    };

    return {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold,
      ...variantTextStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && (
        <Icon 
          name={icon} 
          size={16} 
          color={getTextStyle().color} 
          style={styles.icon}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
  },
});

export default CustomButton;