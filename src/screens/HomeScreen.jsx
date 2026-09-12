import React, {useState, useEffect} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import HomeHeader from '../components/home/HomeHeader';
import ActiveBookingCard from '../components/home/ActiveBookingCard';
import BookingButtons from '../components/home/BookingButtons';
// import QuickServices from '../components/home/QuickServices';
// import TopCaregivers from '../components/home/TopCaregivers';
// import AvailableNurses from '../components/home/AvailableNurses';
import HomeSkeleton from '../components/home/HomeSkeleton';

const HomeScreen = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
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
        contentContainerStyle={styles.scrollContent}>
        <HomeHeader navigation={navigation} />
        <ActiveBookingCard navigation={navigation} />
        <BookingButtons navigation={navigation} />
        {/* <QuickServices navigation={navigation} /> */}
        {/* <TopCaregivers navigation={navigation} /> */}
        {/* <AvailableNurses navigation={navigation} /> */}
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
