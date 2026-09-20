import React from 'react';
import {Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';

const TEAL = '#008178';
const DISABLED = '#A9C5C2';

/**
 * App-wide primary CTA — same look as Select Service "Next".
 */
const PrimaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  variant = 'primary',
}) => {
  const isDisabled = disabled || loading;
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        isSecondary && styles.secondaryButton,
        isDisabled && (isSecondary ? styles.secondaryDisabled : styles.disabled),
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isSecondary ? TEAL : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            styles.text,
            isSecondary && styles.secondaryText,
            textStyle,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 26,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabled: {
    backgroundColor: DISABLED,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  secondaryDisabled: {
    borderColor: DISABLED,
    backgroundColor: '#FFFFFF',
  },
  secondaryText: {
    color: TEAL,
  },
});
