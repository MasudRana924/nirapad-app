import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const AppModal = ({
  visible,
  type = 'error',
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmDestructive = false,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (type === 'success') {
        scaleValue.setValue(0);
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }).start();
      } else {
        scaleValue.setValue(1);
      }
    }
  }, [visible, type, scaleValue]);

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#E1F5ED' }]}>
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <Icon name="check" size={32} color="#008178" />
            </Animated.View>
          </View>
        );
      case 'confirm':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="help-circle" size={32} color="#F59E0B" />
          </View>
        );
      case 'error':
      default:
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Icon name="alert-circle" size={32} color="#DC2626" />
          </View>
        );
    }
  };

  const renderButtons = () => {
    if (type === 'confirm') {
      const confirmColor = confirmDestructive ? '#DC2626' : '#008178';
      return (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              {cancelText}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: confirmColor, flex: 1 }]}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#008178' }]}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
          {type === 'success' ? 'Done' : 'Okay'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={styles.card}>
            <View style={styles.iconContainer}>{renderIcon()}</View>

            {title && <Text style={styles.title}>{title}</Text>}
            {message && <Text style={styles.message}>{message}</Text>}

            {renderButtons()}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#8190A7',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#4B5563',
  },
});

export default AppModal;
