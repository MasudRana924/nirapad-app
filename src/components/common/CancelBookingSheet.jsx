import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const CancelBookingSheet = ({
  visible,
  policy,
  submitting = false,
  onConfirm,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (visible) {
      setAccepted(false);
    }
  }, [visible]);

  const canCancel = policy?.canCancel !== false;
  const refundPercent = policy?.refundPercent;
  const refundAmount = policy?.refundAmount;
  const hoursUntilStart = policy?.hoursUntilStart;
  const policyText = policy?.policy;

  const refundLabel = () => {
    if (refundPercent === 100 || refundPercent === '100') {
      return 'Full refund';
    }
    if (refundPercent === 50 || refundPercent === '50') {
      return '50% refund';
    }
    if (refundPercent === 0 || refundPercent === '0') {
      return 'No refund';
    }
    if (refundPercent == null && refundAmount == null) {
      return 'Free cancellation';
    }
    if (refundPercent != null) {
      return `${refundPercent}% refund`;
    }
    return 'Refund applies per policy';
  };

  const handleClose = () => {
    setAccepted(false);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheet,
                {paddingBottom: Math.max(insets.bottom, 20) + 12},
              ]}>
              <View style={styles.handleRow}>
                <View style={styles.handle} />
              </View>

              <Text style={styles.title}>Cancel booking</Text>
              <Text style={styles.subtitle}>
                {canCancel
                  ? 'Review the refund policy before cancelling.'
                  : 'This booking can no longer be cancelled from the app.'}
              </Text>

              <View style={styles.policyCard}>
                <View style={styles.policyRow}>
                  <Text style={styles.policyLabel}>Refund</Text>
                  <Text style={styles.policyValue}>{refundLabel()}</Text>
                </View>
                {refundAmount != null && refundAmount !== '' && (
                  <View style={styles.policyRow}>
                    <Text style={styles.policyLabel}>Refund amount</Text>
                    <Text style={styles.policyValue}>৳{refundAmount}</Text>
                  </View>
                )}
                {hoursUntilStart != null && hoursUntilStart !== '' && (
                  <View style={styles.policyRow}>
                    <Text style={styles.policyLabel}>Hours until start</Text>
                    <Text style={styles.policyValue}>{hoursUntilStart}h</Text>
                  </View>
                )}
                {!!policyText && (
                  <Text style={styles.policyText}>{policyText}</Text>
                )}
                <Text style={styles.policyHint}>
                  Unpaid bookings cancel free. Paid bookings: 100% if 24 hours
                  or more before start, 50% if 6 hours or more, otherwise no
                  refund.
                </Text>
              </View>

              {canCancel && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.acceptRow}
                  onPress={() => setAccepted(prev => !prev)}>
                  <View
                    style={[
                      styles.checkbox,
                      accepted && styles.checkboxActive,
                    ]}>
                    {accepted ? (
                      <Icon name="checkmark" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text style={styles.acceptText}>
                    I understand the cancellation and refund policy
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!canCancel || !accepted || submitting) &&
                    styles.submitBtnDisabled,
                ]}
                onPress={() => onConfirm?.()}
                disabled={!canCancel || !accepted || submitting}
                activeOpacity={0.85}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>Cancel booking</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.keepBtn}
                onPress={handleClose}
                activeOpacity={0.7}>
                <Text style={styles.keepText}>Keep booking</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
  },
  handleRow: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111820',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8190A7',
    textAlign: 'center',
    marginBottom: 16,
  },
  policyCard: {
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  policyLabel: {
    fontSize: 13,
    color: '#8190A7',
  },
  policyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111820',
  },
  policyText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#4A5568',
  },
  policyHint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: '#8190A7',
  },
  acceptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#E4EEEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: '#008178',
  },
  acceptText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#4A5568',
  },
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#E8A0A0',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  keepBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 4,
  },
  keepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8190A7',
  },
});

export default CancelBookingSheet;
