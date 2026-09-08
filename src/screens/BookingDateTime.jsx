import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/common/Header';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const buildUpcomingDates = (count = 10) => {
  const result = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    result.push({
      id: i + 1,
      day: DAY_LABELS[d.getDay()],
      month: MONTH_LABELS[d.getMonth()],
      date: dd,
      fullDate: `${yyyy}-${mm}-${dd}`,
      isToday: i === 0,
    });
  }
  return result;
};

const TIMES = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
].map((time, index) => ({id: index + 1, time}));

const DURATIONS = [2, 3, 4, 5, 6, 8];

const BookingDateTime = ({navigation, route}) => {
  const {
    selectedMember,
    selectedCaregiver,
    selectedService,
    selectedArea,
    serviceType,
  } = route.params || {};

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [durationHours, setDurationHours] = useState(4);

  const dates = useMemo(() => buildUpcomingDates(10), []);
  const canContinue = !!selectedDate && !!selectedTime;

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Schedule', 'Please select date and time');
      return;
    }

    navigation?.navigate('BookingPreview', {
      selectedMember,
      selectedCaregiver,
      selectedService,
      selectedArea,
      serviceType,
      selectedDate,
      selectedTime,
      durationHours,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Book appointment" onBack={() => navigation?.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.pageHint}>
          Choose when you need the caregiver
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}>
            {dates.map(date => {
              const selected = selectedDate?.id === date.id;
              return (
                <TouchableOpacity
                  key={date.id}
                  activeOpacity={0.85}
                  style={[styles.dateCard, selected && styles.dateCardSelected]}
                  onPress={() => setSelectedDate(date)}>
                  <Text
                    style={[styles.dayText, selected && styles.onTeal]}>
                    {date.isToday ? 'Today' : date.day}
                  </Text>
                  <Text
                    style={[styles.dateNumber, selected && styles.onTeal]}>
                    {date.date}
                  </Text>
                  <Text
                    style={[styles.monthText, selected && styles.onTealSoft]}>
                    {date.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionTitle}>Time</Text>
          <View style={styles.timeGrid}>
            {TIMES.map(time => {
              const selected = selectedTime?.id === time.id;
              return (
                <TouchableOpacity
                  key={time.id}
                  activeOpacity={0.85}
                  style={[styles.timeChip, selected && styles.chipSelected]}
                  onPress={() => setSelectedTime(time)}>
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}>
                    {time.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map(hours => {
              const selected = durationHours === hours;
              return (
                <TouchableOpacity
                  key={hours}
                  activeOpacity={0.85}
                  style={[
                    styles.durationChip,
                    selected && styles.chipSelected,
                  ]}
                  onPress={() => setDurationHours(hours)}>
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}>
                    {hours}h
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.nextButton, !canContinue && styles.disabledButton]}
          onPress={handleNext}
          disabled={!canContinue}>
          <Text style={styles.nextButtonText}>Preview booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BookingDateTime;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  pageHint: {
    fontSize: 14,
    color: '#8190A7',
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: '#F6F6F6',
    borderRadius: 18,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 12,
  },
  dateScroll: {
    marginBottom: 20,
  },
  dateCard: {
    width: 64,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    alignItems: 'center',
    marginRight: 8,
  },
  dateCardSelected: {
    backgroundColor: '#008178',
    borderColor: '#008178',
  },
  dayText: {
    fontSize: 11,
    color: '#8190A7',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 2,
  },
  monthText: {
    fontSize: 11,
    color: '#8190A7',
    fontWeight: '500',
  },
  onTeal: {
    color: '#FFFFFF',
  },
  onTealSoft: {
    color: 'rgba(255,255,255,0.85)',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  timeChip: {
    width: '48%',
    flexGrow: 1,
    maxWidth: '48.5%',
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationChip: {
    minWidth: 48,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#008178',
    borderColor: '#008178',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111820',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,

    
  },
  nextButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#B5C0D0',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
