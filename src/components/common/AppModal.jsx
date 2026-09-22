import React, {useEffect, useRef} from 'react';
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

/**
 * Common app alert/confirm modal — bottom sheet style.
 * Margins: 15px left / right / bottom. Border radius: 15px.
 */
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
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(40);
      fadeAnim.setValue(0);
      iconScale.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, iconScale]);

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <View style={[styles.iconCircle, {backgroundColor: '#E1F5ED'}]}>
            <Animated.View style={{transform: [{scale: iconScale}]}}>
              <Icon name="check" size={28} color="#008178" />
            </Animated.View>
          </View>
        );
      case 'confirm':
        return (
          <View style={[styles.iconCircle, {backgroundColor: '#FEF3C7'}]}>
            <Icon name="help-circle" size={28} color="#F59E0B" />
          </View>
        );
      case 'error':
      default:
        return (
          <View style={[styles.iconCircle, {backgroundColor: '#FEE2E2'}]}>
            <Icon name="alert-circle" size={28} color="#DC2626" />
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
            activeOpacity={0.7}>
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              {cancelText}
            </Text>
          </TouchableOpacity>
          <View style={styles.buttonGap} />
          <TouchableOpacity
            style={[styles.button, styles.flexBtn, {backgroundColor: confirmColor}]}
            onPress={onConfirm}
            activeOpacity={0.7}>
            <Text style={styles.buttonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={onClose}
        activeOpacity={0.7}>
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
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, {opacity: fadeAnim}]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheetWrap,
            {transform: [{translateY: slideAnim}], opacity: fadeAnim},
          ]}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.handle} />
              <View style={styles.iconContainer}>{renderIcon()}</View>
              {!!title && <Text style={styles.title}>{title}</Text>}
              {!!message && <Text style={styles.message}>{message}</Text>}
              {renderButtons()}
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AppModal;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrap: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 14,
  },
  iconContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: '#8190A7',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  buttonGap: {
    width: 10,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexBtn: {
    flex: 1,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#008178',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#4B5563',
  },
});
