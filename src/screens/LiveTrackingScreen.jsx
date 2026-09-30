import React, {useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

/**
 * Legacy route — live map now lives on Booking Details.
 * Redirects so old deep links / stacks still work.
 */
const LiveTrackingScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const {bookingId} = route.params || {};

  useEffect(() => {
    if (!bookingId) {
      navigation.goBack();
      return;
    }
    navigation.replace('BookingDetails', {
      bookingId,
      notificationOpenedAt: Date.now(),
    });
  }, [bookingId, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#008178" />
    </View>
  );
};

export default LiveTrackingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
