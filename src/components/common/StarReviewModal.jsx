import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const StarReviewModal = ({
  visible,
  bookingNumber,
  submitting = false,
  onSubmit,
  onClose,
}) => {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (visible) {
      setRating(0);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (rating < 1 || rating > 5 || submitting) {
      return;
    }
    onSubmit(rating);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="close" size={20} color="#8190A7" />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <Icon name="star" size={28} color="#F6A900" />
          </View>

          <Text style={styles.title}>Rate your experience</Text>
          <Text style={styles.subtitle}>
            {bookingNumber
              ? `How was booking ${bookingNumber}?`
              : 'Tap a star to rate this service'}
          </Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                disabled={submitting}
                style={styles.starBtn}>
                <Icon
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#F6A900' : '#D1D5DB'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (rating < 1 || submitting) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={rating < 1 || submitting}
            activeOpacity={0.85}>
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
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
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    width: Dimensions.get('window').width * 0.86,
    maxWidth: 360,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF6E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111820',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: '#8190A7',
    textAlign: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  starBtn: {
    padding: 2,
  },
  submitBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#A7B4C4',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StarReviewModal;
