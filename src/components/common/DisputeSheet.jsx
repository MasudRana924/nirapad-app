import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const DisputeSheet = ({visible, submitting = false, onSubmit, onClose}) => {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (visible) {
      setReason('');
      setDetails('');
    }
  }, [visible]);

  const canSubmit = reason.trim().length > 0 && !submitting;

  const {t} = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View
                style={[
                  styles.sheet,
                  {paddingBottom: Math.max(insets.bottom, 20) + 12},
                ]}>
                <View style={styles.handleRow}>
                  <View style={styles.handle} />
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Icon name="close" size={22} color="#8190A7" />
                </TouchableOpacity>

                <Text style={styles.title}>{t('openDispute')}</Text>
                <Text style={styles.subtitle}>
                  {t('disputeDesc')}
                </Text>

                <Text style={styles.label}>{t('disputeReason')}</Text>
                <TextInput
                  style={styles.input}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Short reason"
                  placeholderTextColor="#8190A7"
                />

                <Text style={styles.label}>Details (optional)</Text>
                <TextInput
                  style={[styles.input, styles.detailsInput]}
                  value={details}
                  onChangeText={setDetails}
                  placeholder="Add more context"
                  placeholderTextColor="#8190A7"
                  multiline
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    !canSubmit && styles.submitBtnDisabled,
                  ]}
                  onPress={() => onSubmit?.({reason: reason.trim(), details})}
                  disabled={!canSubmit}
                  activeOpacity={0.85}>
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitText}>{t('submitDispute')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
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
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111820',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111820',
    marginBottom: 14,
  },
  detailsInput: {
    height: 96,
    paddingTop: 12,
  },
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#C5CDD8',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DisputeSheet;
