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

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const StarReviewModal = ({
  visible,
  bookingNumber,
  caregiverName,
  submitting = false,
  onSubmit,
  onClose,
}) => {
  const [rating, setRating] = useState(0);
  const insets = useSafeAreaInsets();

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
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, 20) + 12}]}>
              {/* Drag handle */}
              <View style={styles.handleRow}>
                <View style={styles.handle} />
              </View>

              {/* Close button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon name="close" size={22} color="#8190A7" />
              </TouchableOpacity>

              {/* Emoji / Icon */}
              {/* <View style={styles.iconWrap}>
                <Icon name="star" size={32} color="#F6A900" />
              </View> */}

              {/* Title */}
              <Text style={styles.title}>Rate Your Experience</Text>

              {/* Subtitle with caregiver name */}
              <Text style={styles.subtitle}>
                {caregiverName
                  ? `How was the service of ${caregiverName}?`
                  : 'How was your experience with this service?'}
              </Text>

              {/* Stars */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    disabled={submitting}
                    activeOpacity={0.7}
                    style={styles.starBtn}>
                    <Icon
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? '#F6A900' : '#D1D5DB'}
                    />
                  </TouchableOpacity>
                ))}
              </View>


              {/* Submit button */}
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
                  <Text style={styles.submitText}>Submit Rating</Text>
                )}
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
    alignItems: 'center',
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
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
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
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  starBtn: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F6A900',
    marginBottom: 20,
    marginTop: 4,
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
  skipBtn: {
    marginTop: 16,
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    color: '#8190A7',
    fontWeight: '500',
  },
});

export default StarReviewModal;
