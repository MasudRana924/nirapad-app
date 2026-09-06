import React, {useState, useEffect} from 'react';
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

  const handleBook = async () => {
    if (!selectedMember || !selectedCaregiver || !selectedHospital) {
      Alert.alert('Error', 'Missing booking information. Please go back and select family member, caregiver, and hospital.');
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

    console.log('Booking Request Body:', JSON.stringify(bookingData, null, 2));

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Book Appointment" onBack={() => navigation?.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isLoadingData ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading booking details...</Text>
          </View>
        ) : (
          <>
        {/* ================= SELECTED INFO ================= */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Selected Details</Text>
          {selectedMember && (
            <View style={styles.infoItem}>
              <Icon name="person-outline" size={18} color="#008178" />
              <Text style={styles.infoText}>{selectedMember.name}</Text>
            </View>
          )}
          {selectedCaregiver && (
            <View style={styles.infoItem}>
              <Icon name="medkit-outline" size={18} color="#008178" />
              <Text style={styles.infoText}>{selectedCaregiver.name}</Text>
            </View>
          )}
          {selectedHospital && (
            <View style={styles.infoItem}>
              <Icon name="business-outline" size={18} color="#008178" />
              <Text style={styles.infoText}>{selectedHospital.name}</Text>
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

        {/* ================= DURATION ================= */}
        <Text style={styles.sectionTitle}>Duration (Hours)</Text>
        <View style={styles.durationContainer}>
          {[2, 3, 4, 5, 6, 8].map(hours => (
            <TouchableOpacity
              key={hours}
              activeOpacity={0.85}
              style={[
                styles.durationCard,
                durationHours === hours && styles.selectedDurationCard,
              ]}
              onPress={() => setDurationHours(hours)}>
              <Text
                style={[
                  styles.durationText,
                  durationHours === hours && styles.selectedDurationText,
                ]}>
                {hours}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= PICKUP LOCATION ================= */}
        <Text style={styles.sectionTitle}>Pickup Location</Text>
        <View style={styles.inputContainer}>
          <Icon name="location-outline" size={18} color="#7D8BA5" />
          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="#7D8BA5"
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
          <Icon name="map-outline" size={18} color="#7D8BA5" />
          <TextInput
            style={styles.input}
            placeholder="Division (optional)"
            placeholderTextColor="#7D8BA5"
            value={pickupDivision}
            onChangeText={setPickupDivision}
          />
        </View>

        {/* ================= PATIENT REQUIREMENTS ================= */}
        <Text style={styles.sectionTitle}>Patient Requirements</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Describe patient needs, medical conditions, special requirements..."
            placeholderTextColor="#7D8BA5"
            value={patientRequirements}
            onChangeText={setPatientRequirements}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ================= NOTES ================= */}
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Any additional notes for the caregiver..."
            placeholderTextColor="#7D8BA5"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        </>
        )}
      </ScrollView>

      {/* ================= BOOK BUTTON ================= */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.bookButton,
            (!selectedDate || !selectedTime || isSubmitting) && styles.disabledButton,
          ]}
          onPress={handleBook}
          disabled={!selectedDate || !selectedTime || isSubmitting}>
          {isSubmitting ? (
            <Text style={styles.bookButtonText}>Booking...</Text>
          ) : (
            <Text style={styles.bookButtonText}>Book Appointment</Text>
          )}
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

  // ================= INFO CARD =================
  infoCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172333',
    marginBottom: 12,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  infoText: {
    fontSize: 14,
    color: '#172333',
    marginLeft: 8,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  loadingText: {
    fontSize: 16,
    color: '#8190A7',
  },

  // ================= SCROLL =================
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // ================= INPUTS =================
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#172333',
  },

  textAreaContainer: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },

  textArea: {
    fontSize: 14,
    color: '#172333',
    minHeight: 100,
  },

  // ================= DURATION =================
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },

  durationCard: {
    width: '31%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  selectedDurationCard: {
    borderColor: '#008178',
    backgroundColor: '#EAF2FE',
  },

  durationText: {
    fontSize: 14,
    color: '#172333',
  },

  selectedDurationText: {
    color: '#008178',
    fontWeight: '600',
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
    borderColor: '#008178',
    backgroundColor: '#EAF2FE',
  },

  dayText: {
    fontSize: 12,
    color: '#8190A7',
    marginBottom: 4,
  },

  selectedDayText: {
    color: '#008178',
    fontWeight: '600',
  },

  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172333',
  },

  selectedDateText: {
    color: '#008178',
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
    borderColor: '#008178',
    backgroundColor: '#EAF2FE',
  },

  timeText: {
    fontSize: 13,
    color: '#172333',
  },

  selectedTimeText: {
    color: '#008178',
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
