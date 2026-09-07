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
      setSelectedMember(member);
      setSelectedCaregiver(caregiver);
      setSelectedHospital(hospital);
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

  const canBook =
    !!selectedDate && !!selectedTime && !isSubmitting;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Book Appointment" onBack={() => navigation?.goBack()} />

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
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking summary</Text>
              {summaryItems.map(item => (
                <View key={item.key} style={styles.summaryRow}>
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

            {/* Date */}
            <Text style={styles.sectionTitle}>Select date</Text>
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
                      style={[
                        styles.dayText,
                        selected && styles.dateTextSelected,
                      ]}>
                      {date.day}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumber,
                        selected && styles.dateTextSelected,
                      ]}>
                      {date.date}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time */}
            <Text style={styles.sectionTitle}>Select time</Text>
            <View style={styles.chipGrid}>
              {TIMES.map(time => {
                const selected = selectedTime?.id === time.id;
                return (
                  <TouchableOpacity
                    key={time.id}
                    activeOpacity={0.85}
                    style={[styles.chip, selected && styles.chipSelected]}
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

            {/* Duration */}
            <Text style={styles.sectionTitle}>Duration</Text>
            <View style={styles.chipGrid}>
              {DURATIONS.map(hours => {
                const selected = durationHours === hours;
                return (
                  <TouchableOpacity
                    key={hours}
                    activeOpacity={0.85}
                    style={[styles.chip, selected && styles.chipSelected]}
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

            {/* Pickup */}
            <View style={styles.formBlock}>
              <Text style={styles.sectionTitle}>Pickup location</Text>
              <Text style={styles.sectionHint}>
                Where should the caregiver meet the patient?
              </Text>

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

              <View style={styles.inputContainer}>
                <Icon name="map-outline" size={18} color="#8190A7" />
                <TextInput
                  style={styles.input}
                  placeholder="Division (optional)"
                  placeholderTextColor="#8190A7"
                  value={pickupDivision}
                  onChangeText={setPickupDivision}
                />
              </View>
            </View>

            {/* Patient details */}
            <View style={styles.formBlock}>
              <Text style={styles.sectionTitle}>Patient details</Text>
              <Text style={styles.sectionHint}>
                Share needs so the caregiver can prepare.
              </Text>

              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Requirements, conditions, mobility needs..."
                  placeholderTextColor="#8190A7"
                  value={patientRequirements}
                  onChangeText={setPatientRequirements}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <Text style={styles.fieldLabel}>Additional notes (optional)</Text>
              <View style={[styles.textAreaContainer, styles.textAreaShort]}>
                <TextInput
                  style={[styles.textArea, styles.textAreaShortInput]}
                  placeholder="Anything else for the caregiver..."
                  placeholderTextColor="#8190A7"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.bookButton, !canBook && styles.disabledButton]}
          onPress={handleBook}
          disabled={!canBook}>
          <Text style={styles.bookButtonText}>
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
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
    padding: 16,
    paddingBottom: 28,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  loadingText: {
    fontSize: 16,
    color: '#8190A7',
  },

  summaryCard: {
    backgroundColor: '#F6F6F6',
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#F6F6F6',
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172333',
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontWeight: '500',
    color: '#8190A7',
    marginBottom: 2,
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111820',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172333',
    marginBottom: 6,
  },

  sectionHint: {
    fontSize: 13,
    color: '#8190A7',
    marginBottom: 12,
    lineHeight: 18,
  },

  dateScroll: {
    paddingRight: 8,
    marginBottom: 22,
  },

  dateCard: {
    width: 68,
    height: 78,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  dateCardSelected: {
    backgroundColor: '#008178',
    borderColor: '#008178',
  },

  dayText: {
    fontSize: 12,
    color: '#8190A7',
    marginBottom: 4,
    fontWeight: '500',
  },

  dateNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#172333',
  },

  dateTextSelected: {
    color: '#FFFFFF',
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 22,
    marginHorizontal: -4,
  },

  chip: {
    width: '31%',
    marginHorizontal: '1.16%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  chipSelected: {
    backgroundColor: '#008178',
    borderColor: '#008178',
  },

  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#172333',
  },

  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  formBlock: {
    marginBottom: 8,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#172333',
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#172333',
  },

  textAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  textAreaShort: {
    marginBottom: 8,
  },

  textArea: {
    fontSize: 14,
    color: '#172333',
    minHeight: 96,
  },

  textAreaShortInput: {
    minHeight: 72,
  },

  bottomContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },

  bookButton: {
    backgroundColor: '#008178',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },

  disabledButton: {
    backgroundColor: '#B5C0D0',
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
