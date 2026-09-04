import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const BookingDateTime = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const {selectedMember, selectedCaregiver, selectedHospital} = route.params || {};

  const dates = [
    {id: 1, day: 'Mon', date: '15', fullDate: '2024-01-15'},
    {id: 2, day: 'Tue', date: '16', fullDate: '2024-01-16'},
    {id: 3, day: 'Wed', date: '17', fullDate: '2024-01-17'},
    {id: 4, day: 'Thu', date: '18', fullDate: '2024-01-18'},
    {id: 5, day: 'Fri', date: '19', fullDate: '2024-01-19'},
    {id: 6, day: 'Sat', date: '20', fullDate: '2024-01-20'},
    {id: 7, day: 'Sun', date: '21', fullDate: '2024-01-21'},
  ];

  const times = [
    {id: 1, time: '09:00 AM'},
    {id: 2, time: '10:00 AM'},
    {id: 3, time: '11:00 AM'},
    {id: 4, time: '12:00 PM'},
    {id: 5, time: '02:00 PM'},
    {id: 6, time: '03:00 PM'},
    {id: 7, time: '04:00 PM'},
    {id: 8, time: '05:00 PM'},
  ];

  const handleProceed = () => {
    if (selectedDate && selectedTime) {
      navigation?.navigate('BookingConfirmed', {
        selectedMember,
        selectedCaregiver,
        selectedHospital,
        selectedDate,
        selectedTime,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation?.goBack()}>
          <Icon name="arrow-back" size={24} color="#172333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Book Appointment</Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: 100 + insets.bottom}]}
        showsVerticalScrollIndicator={false}>
        {/* ================= BOOKING SUMMARY ================= */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>

          {/* Family Member */}
          {selectedMember && (
            <View style={styles.summaryItem}>
              <View style={styles.summaryItemLeft}>
                <Image
                  source={{uri: selectedMember.image}}
                  style={styles.summaryImage}
                />
                <View style={styles.summaryItemText}>
                  <Text style={styles.summaryLabel}>Family Member</Text>
                  <Text style={styles.summaryValue}>{selectedMember.name}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Caregiver */}
          {selectedCaregiver && (
            <View style={styles.summaryItem}>
              <View style={styles.summaryItemLeft}>
                <Image
                  source={{uri: selectedCaregiver.image}}
                  style={styles.summaryImage}
                />
                <View style={styles.summaryItemText}>
                  <Text style={styles.summaryLabel}>Caregiver</Text>
                  <Text style={styles.summaryValue}>{selectedCaregiver.name}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Hospital */}
          {selectedHospital && (
            <View style={styles.summaryItem}>
              <View style={styles.summaryItemLeft}>
                <View style={styles.hospitalIcon}>
                  <Icon name="business" size={20} color="#2478D4" />
                </View>
                <View style={styles.summaryItemText}>
                  <Text style={styles.summaryLabel}>Hospital</Text>
                  <Text style={styles.summaryValue}>{selectedHospital.name}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ================= SELECT DATE ================= */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}>
          {dates.map(date => (
            <TouchableOpacity
              key={date.id}
              activeOpacity={0.85}
              style={[
                styles.dateCard,
                selectedDate?.id === date.id && styles.selectedDateCard,
              ]}
              onPress={() => setSelectedDate(date)}>
              <Text
                style={[
                  styles.dayText,
                  selectedDate?.id === date.id && styles.selectedDayText,
                ]}>
                {date.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDate?.id === date.id && styles.selectedDateText,
                ]}>
                {date.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ================= SELECT TIME ================= */}
        <Text style={styles.sectionTitle}>Select Time</Text>
        <View style={styles.timeGrid}>
          {times.map(time => (
            <TouchableOpacity
              key={time.id}
              activeOpacity={0.85}
              style={[
                styles.timeCard,
                selectedTime?.id === time.id && styles.selectedTimeCard,
              ]}
              onPress={() => setSelectedTime(time)}>
              <Text
                style={[
                  styles.timeText,
                  selectedTime?.id === time.id && styles.selectedTimeText,
                ]}>
                {time.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ================= PROCEED BUTTON ================= */}
      <View style={[styles.bottomContainer, {paddingBottom: 16 + insets.bottom}]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.proceedButton,
            (!selectedDate || !selectedTime) && styles.disabledButton,
          ]}
          onPress={handleProceed}
          disabled={!selectedDate || !selectedTime}>
          <Text style={styles.proceedButtonText}>Proceed to Book</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BookingDateTime;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ================= HEADER =================
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172333',
  },

  placeholder: {
    width: 36,
  },

  // ================= SCROLL =================
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // ================= SUMMARY =================
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172333',
    marginBottom: 16,
  },

  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  summaryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  summaryImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },

  hospitalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  summaryItemText: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 12,
    color: '#8190A7',
    marginBottom: 2,
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172333',
  },

  // ================= SECTION TITLE =================
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172333',
    marginBottom: 12,
  },

  // ================= DATE =================
  dateScroll: {
    paddingRight: 16,
    marginBottom: 24,
  },

  dateCard: {
    width: 70,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  selectedDateCard: {
    borderColor: '#2478D4',
    backgroundColor: '#EAF2FE',
  },

  dayText: {
    fontSize: 12,
    color: '#8190A7',
    marginBottom: 4,
  },

  selectedDayText: {
    color: '#2478D4',
    fontWeight: '600',
  },

  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172333',
  },

  selectedDateText: {
    color: '#2478D4',
  },

  // ================= TIME =================
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  timeCard: {
    width: '31%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  selectedTimeCard: {
    borderColor: '#2478D4',
    backgroundColor: '#EAF2FE',
  },

  timeText: {
    fontSize: 13,
    color: '#172333',
  },

  selectedTimeText: {
    color: '#2478D4',
    fontWeight: '600',
  },

  // ================= BOTTOM =================
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,

  },

  proceedButton: {
    backgroundColor: '#2478D4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },

  disabledButton: {
    backgroundColor: '#B5C0D0',
  },

  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
