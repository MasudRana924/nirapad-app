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
          <Text style={styles.title}>Error</Text>
          <View style={styles.dottedLine} />
          <Text style={styles.message}>{message}</Text>
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
    padding: 20,
    width: Dimensions.get('window').width * 0.8,
    maxWidth: 320,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 8,
  },
  dottedLine: {
    width: '100%',
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderStyle: 'dotted',
    marginBottom: 12,
  },
  message: {
    fontSize: 10,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 14,
  },
  okButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  okButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111820',
  },
});

export default ErrorModal;
