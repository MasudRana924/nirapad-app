import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useCreateBooking} from '../api/mutations';
import {storage} from '../utils/storage';
import Header from '../components/common/Header';
import SearchableDropdown from '../components/common/SearchableDropdown';
import {bangladeshDistricts, bangladeshCities} from '../data/bangladeshLocations';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const buildUpcomingDates = (count = 7) => {
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
      date: dd,
      fullDate: `${yyyy}-${mm}-${dd}`,
    });
  }
  return result;
};

const TIMES = [
  {id: 1, time: '09:00 AM'},
  {id: 2, time: '10:00 AM'},
  {id: 3, time: '11:00 AM'},
  {id: 4, time: '12:00 PM'},
  {id: 5, time: '02:00 PM'},
  {id: 6, time: '03:00 PM'},
  {id: 7, time: '04:00 PM'},
  {id: 8, time: '05:00 PM'},
];

const DURATIONS = [2, 3, 4, 5, 6, 8];

const BookingDateTime = ({navigation}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [pickupDistrict, setPickupDistrict] = useState('');
  const [pickupDivision, setPickupDivision] = useState('');
  const [patientRequirements, setPatientRequirements] = useState('');
  const [notes, setNotes] = useState('');
  const [durationHours, setDurationHours] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const dates = useMemo(() => buildUpcomingDates(7), []);
  const createBooking = useCreateBooking();

  useEffect(() => {
    loadBookingData();
  }, []);

  const loadBookingData = async () => {
    try {
      const member = await storage.getSelectedFamilyMember();
      const caregiver = await storage.getSelectedCaregiver();
      const hospital = await storage.getSelectedHospital();
      const area = await storage.getSelectedArea();
      setSelectedMember(member);
      setSelectedCaregiver(caregiver);
      setSelectedHospital(hospital);
      if (area?.district) {
        setPickupDistrict(area.district);
      }
      if (area?.thana) {
        setPickupCity(area.thana);
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleBook = async () => {
    if (!selectedMember || !selectedCaregiver || !selectedHospital) {
      Alert.alert(
        'Error',
        'Missing booking information. Please go back and select family member, caregiver, and hospital.',
      );
      return;
    }

    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    if (!pickupAddress || !pickupCity || !pickupDistrict) {
      Alert.alert('Error', 'Please fill in pickup location details');
      return;
    }

    if (!patientRequirements) {
      Alert.alert('Error', 'Please provide patient requirements');
      return;
    }

    const token = await storage.getAuthToken();
    if (!token) {
      Alert.alert('Error', 'Please login to book an appointment');
      return;
    }

    setIsSubmitting(true);

    const bookingData = {
      service_type: 'HOME_CARE',
      family_member_id: selectedMember.id || selectedMember.uuid,
      provider_type: 'CAREGIVER',
      provider_id: selectedCaregiver.id || selectedCaregiver.uuid,
      hospital_id: selectedHospital.id || selectedHospital.uuid,
      booking_date: selectedDate.fullDate,
      start_time: selectedTime.time.replace(' AM', '').replace(' PM', ''),
      duration_hours: durationHours,
      pickup_location: {
        address: pickupAddress,
        city: pickupCity,
        district: pickupDistrict,
        division: pickupDivision || pickupDistrict,
        latitude: 23.8103,
        longitude: 90.4125,
      },
      patient_requirements: patientRequirements,
      notes: notes,
    };

    try {
      const response = await createBooking.mutateAsync(bookingData);
      await storage.clearBookingData();
      navigation?.navigate('BookingConfirmed', {
        message: response.message || 'Booking created successfully',
        status: response.data?.status || 'PENDING_PAYMENT',
        bookingNumber: response.data?.booking_number,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const summaryItems = [
    {
      key: 'patient',
      label: 'Patient',
      value: selectedMember?.name,
      icon: 'person-outline',
    },
    {
      key: 'caregiver',
      label: 'Caregiver',
      value: selectedCaregiver?.name,
      icon: 'medkit-outline',
    },
    {
      key: 'hospital',
      label: 'Hospital',
      value: selectedHospital?.name,
      icon: 'business-outline',
    },
  ];

  const canBook = !!selectedDate && !!selectedTime && !isSubmitting;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Book appointment" onBack={() => navigation?.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {isLoadingData ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading booking details...</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              {summaryItems.map((item, index) => (
                <View
                  key={item.key}
                  style={[
                    styles.summaryRow,
                    index === summaryItems.length - 1 && styles.summaryRowLast,
                  ]}>
                  <View style={styles.summaryIcon}>
                    <Icon name={item.icon} size={18} color="#008178" />
                  </View>
                  <View style={styles.summaryTextBlock}>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                    <Text style={styles.summaryValue} numberOfLines={1}>
                      {item.value || 'Not selected'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

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
                    style={[styles.dateCard, selected && styles.chipSelected]}
                    onPress={() => setSelectedDate(date)}>
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.chipTextSelected,
                      ]}>
                      {date.day}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumber,
                        selected && styles.chipTextSelected,
                      ]}>
                      {date.date}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionTitle}>Time</Text>
            <View style={styles.chipRow}>
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
            <View style={styles.chipRow}>
              {DURATIONS.map(hours => {
                const selected = durationHours === hours;
                return (
                  <TouchableOpacity
                    key={hours}
                    activeOpacity={0.85}
                    style={[styles.durationChip, selected && styles.chipSelected]}
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

            <Text style={styles.sectionTitle}>Pickup location</Text>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <Icon name="location-outline" size={18} color="#8190A7" />
              <TextInput
                style={styles.input}
                placeholder="Street address"
                placeholderTextColor="#8190A7"
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
            </View>

            <SearchableDropdown
              data={bangladeshCities}
              label="City"
              placeholder="Select city"
              value={pickupCity}
              onSelect={setPickupCity}
              icon="business-outline"
            />
            <SearchableDropdown
              data={bangladeshDistricts}
              label="District"
              placeholder="Select district"
              value={pickupDistrict}
              onSelect={setPickupDistrict}
              icon="location-outline"
            />

            <Text style={styles.label}>Division (optional)</Text>
            <View style={styles.inputContainer}>
              <Icon name="map-outline" size={18} color="#8190A7" />
              <TextInput
                style={styles.input}
                placeholder="Division"
                placeholderTextColor="#8190A7"
                value={pickupDivision}
                onChangeText={setPickupDivision}
              />
            </View>

            <Text style={styles.sectionTitle}>Patient needs</Text>
            <Text style={styles.label}>Requirements *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Conditions, mobility needs, special care..."
              placeholderTextColor="#8190A7"
              value={patientRequirements}
              onChangeText={setPatientRequirements}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.textArea, styles.textAreaShort]}
              placeholder="Anything else for the caregiver..."
              placeholderTextColor="#8190A7"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.bookButton, !canBook && styles.disabledButton]}
          onPress={handleBook}
          disabled={!canBook}>
          <Text style={styles.bookButtonText}>
            {isSubmitting ? 'Booking...' : 'Confirm booking'}
          </Text>
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
    paddingBottom: 28,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 15,
    color: '#8190A7',
  },
  summaryCard: {
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryRowLast: {
    marginBottom: 0,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#8190A7',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111820',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 12,
    marginTop: 4,
  },
  dateScroll: {
    paddingRight: 8,
    marginBottom: 20,
  },
  dateCard: {
    width: 56,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dayText: {
    fontSize: 11,
    color: '#8190A7',
    marginBottom: 4,
    fontWeight: '500',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111820',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  timeChip: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationChip: {
    width: 52,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F6F6F6',
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
    fontWeight: '500',
    color: '#111820',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111820',
    marginBottom: 8,
  },
  inputContainer: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111820',
    paddingVertical: 0,
  },
  textArea: {
    minHeight: 96,
    borderRadius: 14,
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111820',
    marginBottom: 14,
  },
  textAreaShort: {
    minHeight: 72,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    backgroundColor: '#FFFFFF',
  },
  bookButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#B5C0D0',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
