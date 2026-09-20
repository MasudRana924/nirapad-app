import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {bookingService} from '../api/services';
import {getApiErrorMessage} from '../api/client';
import PrimaryButton from '../components/common/PrimaryButton';
import {useAppModal} from '../contexts/ModalContext';

const ReviewScreen = ({route, navigation}) => {
  const {bookingId} = route.params || {};
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const {showError, showSuccess} = useAppModal();

  const handleRating = value => {
    setRating(value);
  };

  const submitReview = async () => {
    if (rating === 0) {
      showError('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await bookingService.submitReview(bookingId, {
        rating,
        comment: review.trim(),
      });
      showSuccess('Thank you for your review!');
      navigation.navigate('BookingDetails', {bookingId});
    } catch (error) {
      console.error('Review submission error:', error);
      showError(getApiErrorMessage(error, 'Failed to submit review'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111820" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>Rate your experience</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRating(star)}
                style={styles.starButton}>
                <Icon
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= rating ? '#FFD700' : '#D1D5DB'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.reviewContainer}>
          <Text style={styles.reviewTitle}>Your review</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience with the caregiver..."
            placeholderTextColor="#8190A7"
            multiline
            numberOfLines={6}
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />
        </View>

        <PrimaryButton
          title="Submit Review"
          onPress={submitReview}
          disabled={loading}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111820',
    textAlign: 'center',
    marginRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  ratingContainer: {
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111820',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  reviewContainer: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111820',
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#111820',
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#008178',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#8190A7',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ReviewScreen;
