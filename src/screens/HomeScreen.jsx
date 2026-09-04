import React from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import HomeHeader from '../components/home/HomeHeader';
import ActiveBookingCard from '../components/home/ActiveBookingCard';
import BookingButtons from '../components/home/BookingButtons';
import QuickServices from '../components/home/QuickServices';
import TopCaregivers from '../components/home/TopCaregivers';
import AvailableNurses from '../components/home/AvailableNurses';

const HomeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <HomeHeader navigation={navigation} />
        <ActiveBookingCard navigation={navigation} />
        <BookingButtons navigation={navigation} />
        <QuickServices navigation={navigation} />
        <TopCaregivers navigation={navigation} />
        <AvailableNurses navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 85,
  },
});
