import React, {useCallback, useState} from 'react';
import {StyleSheet, ScrollView, RefreshControl, View, StatusBar} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import HomeHeader from '../components/home/HomeHeader';
import ActiveBookingCard from '../components/home/ActiveBookingCard';
import BookingButtons from '../components/home/BookingButtons';
import HomeFamilySection from '../components/home/HomeFamilySection';
import HomeProviderSection from '../components/home/HomeProviderSection';
import HomeRecentActivity from '../components/home/HomeRecentActivity';
import HomeSkeleton from '../components/home/HomeSkeleton';
import {
  useUserProfile,
  useBookings,
  useFamilyMembers,
  useSearchCaregivers,
} from '../api/queries';
import {NURSES} from '../data/nurses';
import {useTranslation} from 'react-i18next';
import {isActiveStatus, isSearchingStatus} from '../utils/bookingStatus';
import {useTabBarInset} from '../navigation/tabBarLayout';

const PAGE = '#FFFFFF';

const HomeScreen = ({navigation}) => {
  const {
    isLoading: profileLoading,
    data: profileData,
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
  const {t} = useTranslation();
  const {data: caregiversData, refetch: refetchCaregivers} =
    useSearchCaregivers({limit: 10});
  const caregiverItems = (
    Array.isArray(caregiversData?.data) ? caregiversData.data : []
  ).map(caregiver => ({
    id: caregiver.id,
    name: caregiver.name || t('caregiverProfile'),
    photo: caregiver.profile_photo,
    meta: `${caregiver.rating ?? '0.0'} · ${caregiver.experience_years ?? 0} ${t('yrs')}`,
    raw: caregiver,
  }));
  const nurseItems = NURSES.map(nurse => ({
    id: nurse.id,
    name: nurse.name,
    photo: nurse.image,
    meta: `${nurse.rating} · ${nurse.experience}`,
    raw: nurse,
  }));

  const bookings = Array.isArray(bookingsData?.data) ? bookingsData.data : [];
  const activeBooking = bookings.find(item => isActiveStatus(item?.status));
  const [refreshing, setRefreshing] = useState(false);
  const tabBarInset = useTabBarInset();

  const reloadHome = useCallback(async () => {
    await Promise.all([
      refetchProfile(),
      refetchBookings(),
      refetchFamily(),
      refetchCaregivers(),
    ]);
  }, [refetchBookings, refetchCaregivers, refetchFamily, refetchProfile]);

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
      <HomeHeader navigation={navigation} profile={profileData?.data || profileData} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: tabBarInset}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0E8B78']}
            tintColor="#0E8B78"
          />
        }>
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
        <HomeProviderSection
          title={t('homeCaregiversTitle')}
          items={caregiverItems}
          onViewAll={() => navigation?.navigate('AllCaregivers')}
          onItemPress={caregiver =>
            navigation?.navigate('CaregiverDetails', {caregiver})
          }
        />
        <HomeProviderSection
          title={t('homeNursesTitle')}
          items={nurseItems}
          onViewAll={() => navigation?.navigate('SelectNurse')}
          onItemPress={nurse =>
            navigation?.navigate('NurseDetails', {caregiver: nurse})
          }
        />
        <View style={styles.recentActivityWrap}>
          <HomeRecentActivity navigation={navigation} booking={bookings[0]} />
        </View>
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
  activeWrap: {
    marginTop: 4,
    paddingHorizontal: 16,
  },
  recentActivityWrap: {
    paddingHorizontal: 16,
  },
});
