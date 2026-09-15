import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const PaymentCancelledScreen = ({navigation, route}) => {
  const {bookingId} = route.params || {};

  const handleGoBack = () => {
    if (bookingId) {
      navigation?.navigate('BookingDetails', {bookingId});
    } else {
      navigation?.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Icon name="close" size={44} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.title}>Payment Cancelled</Text>
          <Text style={styles.subtitle}>
            Your payment was not completed. You can try again from the booking
            details page.
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.goBackButton}
            onPress={handleGoBack}>
            {/* <Icon name="arrow-back-outline" size={20} color="#FFFFFF" /> */}
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PaymentCancelledScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FEECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111820',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#8190A7',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bottomSection: {
    paddingBottom: 16,
  },
  goBackButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  goBackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
