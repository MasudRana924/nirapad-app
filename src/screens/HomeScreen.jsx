import React, {useCallback, useState} from 'react';
import {StyleSheet, ScrollView, RefreshControl, View, StatusBar} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import HomeHeader from '../components/home/HomeHeader';
import HomeHeroCard from '../components/home/HomeHeroCard';
import ActiveBookingCard from '../components/home/ActiveBookingCard';
import BookingButtons from '../components/home/BookingButtons';
import HomeFamilySection from '../components/home/HomeFamilySection';
import HomeSkeleton from '../components/home/HomeSkeleton';
import {
  useUserProfile,
  useBookings,
  useFamilyMembers,
} from '../api/queries';
import {isActiveStatus, isSearchingStatus} from '../utils/bookingStatus';

const PAGE = '#FFFFFF';

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
  const {
    isLoading: familyLoading,
    data: familyData,
    refetch: refetchFamily,
  } = useFamilyMembers();
  const familyMembers = Array.isArray(familyData?.data) ? familyData.data : [];

  const bookings = Array.isArray(bookingsData?.data) ? bookingsData.data : [];
  const activeBooking = bookings.find(item => isActiveStatus(item?.status));
  const [refreshing, setRefreshing] = useState(false);

  const reloadHome = useCallback(async () => {
    await Promise.all([
      refetchProfile(),
      refetchBookings(),
      refetchFamily(),
    ]);
  }, [refetchBookings, refetchFamily, refetchProfile]);

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
    (profileLoading || bookingsLoading || familyLoading) && !refreshing;

  if (isInitialLoading) {
    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <HomeSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <HomeHeader navigation={navigation} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0E8B78']}
            tintColor="#0E8B78"
          />
        }>
        <HomeHeroCard navigation={navigation} />

        {activeBooking ? (
          <View style={styles.activeWrap}>
            <ActiveBookingCard
              navigation={navigation}
              booking={activeBooking}
              searching={isSearchingStatus(activeBooking.status)}
            />
          </View>
        ) : null}

        <BookingButtons navigation={navigation} />
        <HomeFamilySection navigation={navigation} members={familyMembers} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE,
  },
  scrollContent: {
    paddingBottom: 18,
  },
  activeWrap: {
    marginTop: 4,
    paddingHorizontal: 16,
  },
});
