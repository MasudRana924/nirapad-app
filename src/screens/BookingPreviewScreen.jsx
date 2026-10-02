import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Loader from '../components/common/Loader';
import Header from '../components/common/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import Toast from '../components/common/Toast';
import {useCreateBooking} from '../api/mutations';
import {storage} from '../utils/storage';
import {API_CODES, getApiErrorMessage} from '../api/client';
import {useAppModal} from '../contexts/ModalContext';
import {useTranslation} from 'react-i18next';
import {isMissingProfileNameError, isSelfMember} from '../utils/bookingPatient';

const toStartTime = timeValue => {
  if (!timeValue) {
    return '';
  }
  const raw = String(timeValue).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) {
    return raw.replace(/\s*(AM|PM)$/i, '');
  }
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }
  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const mapServiceType = (selectedService, selectedHospital) => {
  if (selectedHospital) {
    return 'HOSPITAL_ASSISTANCE';
  }
  const key = selectedService?.id || selectedService?.category || '';
  if (key === 'hospital_companion') {
    return 'HOSPITAL_ASSISTANCE';
  }
  return 'HOME_CARE';
};

const Row = ({label, value, last}) => (
  <View style={[styles.row, last && styles.rowLast]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

const Section = ({icon, title, children, first}) => (
  <View style={[styles.section, first && styles.sectionFirst]}>
    <View style={styles.cardHeader}>
      <View style={styles.iconTile}>
        <Icon name={icon} size={16} color="#008178" />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const BookingPreviewScreen = ({navigation, route}) => {
  const {
    selectedMember,
    selectedCaregiver,
    selectedService,
    selectedArea,
    selectedHospital,
    selectedDate,
    selectedTime,
    durationHours = 4,
    notes = '',
  } = route.params || {};

  const {t} = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'error',
  });
  const createBooking = useCreateBooking();
  const {showError, showConfirm} = useAppModal();
  const bookingForSelf = isSelfMember(selectedMember);

  const hourlyRate =
    selectedCaregiver?.hourly_rate ||
    selectedCaregiver?.price ||
    selectedService?.price ||
    500;
  const estimatedTotal = Number(hourlyRate) * Number(durationHours);

  const locationText = [
    selectedArea?.fullAddress,
    selectedArea?.thana,
    selectedArea?.district,
  ]
    .filter(Boolean)
    .join(', ');

  const scheduleText =
    selectedDate && selectedTime
      ? `${selectedDate.day}, ${selectedDate.date} ${selectedDate.month} · ${selectedTime.time} · ${durationHours}h`
      : '—';

  const handleConfirm = async () => {
    if (!selectedMember || !selectedCaregiver) {
      showError('Missing booking details. Please go back and try again.');
      return;
    }

    const token = await storage.getAuthToken();
    if (!token) {
      showError('Please login to book an appointment');
      return;
    }

    if (!selectedHospital?.id) {
      showError('Please select a hospital to continue');
      return;
    }

    setIsSubmitting(true);

    const commonData = {
      provider_id: selectedCaregiver.id || selectedCaregiver.uuid,
      hospital_id: selectedHospital.id,
      booking_date: selectedDate.fullDate,
      start_time: toStartTime(selectedTime.time),
      duration_hours: durationHours,
      service_type: mapServiceType(selectedService, selectedHospital),
      patient_requirements: selectedService?.title
        ? `${selectedService.title} service requested`
        : 'Home care service',
      notes: notes || '',
    };

    const bookingData = bookingForSelf
      ? {
          book_for: 'SELF',
          ...commonData,
          ...(selectedArea?.district ? {district: selectedArea.district} : {}),
          ...(selectedArea?.thana ? {thana: selectedArea.thana} : {}),
          ...(selectedArea?.fullAddress
            ? {house: selectedArea.fullAddress}
            : {}),
        }
      : {
          family_member_id: selectedMember.id || selectedMember.uuid,
          ...commonData,
        };

    try {
      const response = await createBooking.mutateAsync(bookingData);
      await storage.clearBookingData();
      navigation?.navigate('BookingConfirmed', {
        message: response.message || 'Booking created successfully',
        status: response.data?.status || 'PROVIDER_ASSIGNED',
        bookingNumber: response.data?.booking_number,
      });
    } catch (error) {
      if (bookingForSelf && isMissingProfileNameError(error)) {
        showConfirm({
          title: t('profileNameRequired', 'Profile name required'),
          message: getApiErrorMessage(
            error,
            t(
              'addNameBeforeSelfBooking',
              'Add your name on your profile before booking for yourself',
            ),
          ),
          confirmText: t('editProfile', 'Edit profile'),
          cancelText: t('cancel', 'Cancel'),
          onConfirm: () => navigation?.navigate('EditProfile'),
        });
        return;
      }
      if (error?.code === API_CODES.CONFLICT) {
        setToast({
          visible: true,
          message: getApiErrorMessage(
            error,
            'Caregiver already has a booking in this time slot',
          ),
          type: 'error',
        });
        return;
      }
      const message =
        getApiErrorMessage(error, 'Failed to create booking. Please try again.');
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Loader visible={isSubmitting} />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(current => ({...current, visible: false}))}
      />
      <Header title={t('bookingPreview', 'Booking Preview')} onBack={() => navigation?.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>
          {t('reviewBookingDesc', 'Review your booking details before confirming')}
        </Text>

        <View style={styles.card}>
        <Section first icon="person-outline" title={t('patient', 'Care recipient')}>
          <Row label={t('name', 'Name')} value={selectedMember?.name} />
          <Row
            label={t('relationship', 'Relation')}
            value={
              bookingForSelf ? t('myself', 'Myself') : selectedMember?.relationship
            }
            last
          />
        </Section>

        <Section icon="grid-outline" title={t('service', 'Service')}>
          <Row label={t('type', 'Type')} value={selectedService?.title} />
          <Row label={t('rate', 'Rate')} value={selectedService?.priceLabel} last />
        </Section>

        <Section
          icon="medkit-outline"
          title={t('caregiverDetails', 'Care provider')}>
          <Row label={t('name', 'Name')} value={selectedCaregiver?.name} />
          <Row
            label={t('experience', 'Experience')}
            value={
              selectedCaregiver?.experience_years
                ? `${selectedCaregiver.experience_years} ${t('yrs', 'years')}`
                : '—'
            }
            last
          />
        </Section>

        {!!selectedHospital?.name && (
          <Section icon="business-outline" title={t('hospital', 'Hospital')}>
            <Row label={t('name', 'Name')} value={selectedHospital.name} last />
          </Section>
        )}

        <Section icon="location-outline" title={t('location', 'Location')}>
          <Row label={t('address', 'Address')} value={locationText} last />
        </Section>

        <Section icon="calendar-outline" title={t('schedule', 'Schedule')}>
          <Row
            label={t('dateAndTime', 'Date and time')}
            value={scheduleText}
            last
          />
        </Section>

        {!!notes && (
          <Section icon="document-text-outline" title={t('notes', 'Notes')}>
            <Row label={t('notes', 'Notes')} value={notes} last />
          </Section>
        )}

        <View style={styles.pricingSummary}>
          <View style={styles.pricingCopy}>
            <Text style={styles.pricingLabel}>
              {t('estimatedPricing', 'Estimated pricing')}
            </Text>
            <Text style={styles.pricingNote}>
              ৳{hourlyRate}/{t('hr', 'hr')} × {durationHours} {t('hours', 'hours')}
            </Text>
          </View>
          <Text style={styles.pricingValue}>৳{estimatedTotal}</Text>
        </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <PrimaryButton
          title={t('confirmBooking', 'Confirm booking')}
          onPress={handleConfirm}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
};

export default BookingPreviewScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  hint: {
    fontSize: 14,
    color: '#8190A7',
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECEB',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 12,
  },
  section: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F3',
  },
  sectionFirst: {
    borderTopWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#E8F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#172824',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 7,
    gap: 16,
  },
  rowLast: {
    paddingBottom: 0,
  },
  rowLabel: {
    fontSize: 13,
    lineHeight: 19,
    color: '#8A9A97',
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
    color: '#2E3F3B',
  },
  pricingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F9F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  pricingCopy: {
    flex: 1,
    marginRight: 12,
  },
  pricingLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#008178',
  },
  pricingValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B6E65',
  },
  pricingNote: {
    marginTop: 3,
    fontSize: 12,
    color: '#8A9A97',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,

  },
  confirmButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#B5C0D0',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
