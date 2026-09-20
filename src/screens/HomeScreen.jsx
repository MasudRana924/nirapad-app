import React, {useCallback, useState} from 'react';
import {StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import HomeHeader from '../components/home/HomeHeader';
import ActiveBookingCard from '../components/home/ActiveBookingCard';
import EmptyActiveBookingCard from '../components/home/EmptyActiveBookingCard';
import BookingButtons from '../components/home/BookingButtons';
import HomeSkeleton from '../components/home/HomeSkeleton';
import {useUserProfile, useBookings} from '../api/queries';
import {isActiveStatus, isSearchingStatus} from '../utils/bookingStatus';

const HomeScreen = ({navigation}) => {
  const {
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useUserProfile();
  const {
    isLoading: bookingsLoading,
    data: bookingsData,
    refetch: refetchBookings,
  } = useBookings({page: 1, limit: 20});
  const bookings = Array.isArray(bookingsData?.data) ? bookingsData.data : [];
  const activeBooking = bookings.find(item => isActiveStatus(item?.status));
  const [refreshing, setRefreshing] = useState(false);

  const reloadHome = useCallback(async () => {
    await Promise.all([refetchProfile(), refetchBookings()]);
  }, [refetchBookings, refetchProfile]);

  useFocusEffect(
    useCallback(() => {
      reloadHome();
    }, [reloadHome]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadHome();
    } finally {
      setRefreshing(false);
    }
  }, [reloadHome]);

  const isInitialLoading =
    (profileLoading || bookingsLoading) && !refreshing;

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#008178']}
            tintColor="#008178"
          />
        }>
        <HomeHeader navigation={navigation} />
        {activeBooking ? (
          <ActiveBookingCard
            navigation={navigation}
            booking={activeBooking}
            searching={isSearchingStatus(activeBooking.status)}
          />
        ) : (
          <EmptyActiveBookingCard navigation={navigation} />
        )}

        <BookingButtons navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
});
