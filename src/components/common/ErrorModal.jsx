import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const ErrorModal = ({visible, message, onOk}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onOk}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.dottedWrap}>
            <View style={styles.dottedLine} />
          </View>
          <TouchableOpacity style={styles.okButton} onPress={onOk}>
            <Text style={styles.okButtonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 12,
    width: Dimensions.get('window').width * 0.8,
    maxWidth: 320,
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  dottedWrap: {
    width: '100%',
    height: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  dottedLine: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dotted',
  },
  okButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  okButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111820',
  },
});

export default ErrorModal;
