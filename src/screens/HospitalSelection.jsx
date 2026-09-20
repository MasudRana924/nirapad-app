import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSearchHospitals} from '../api/queries';
import HospitalSkeleton from '../components/home/HospitalSkeleton';
import SearchableDropdown from '../components/common/SearchableDropdown';
import PrimaryButton from '../components/common/PrimaryButton';
import {bangladeshDistricts, bangladeshCities} from '../data/bangladeshLocations';
import {storage} from '../utils/storage';

const TEAL = '#008178';
const INK = '#163532';
const MUTED = '#7B9390';

const formatMoney = value => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '0.00';
  }
  return numeric.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatRating = value => {
  const numeric = Number(value);
  if (value == null || value === '' || Number.isNaN(numeric)) {
    return '0.00';
  }
  return numeric.toFixed(2);
};

const HospitalSelection = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {selectedMember, selectedCaregiver, selectedService, selectedArea, serviceType} =
    route.params || {};
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [district, setDistrict] = useState(selectedArea?.district || '');
  const [city, setCity] = useState(selectedArea?.thana || '');

  const {data: hospitalsData, isLoading} = useSearchHospitals({
    district,
  });

  const hospitals = Array.isArray(hospitalsData?.data)
    ? hospitalsData.data
    : [];

  const handleNext = () => {
    if (selectedHospital) {
      storage.saveSelectedHospital(selectedHospital);
      navigation?.navigate('BookingDateTime', {
        selectedMember,
        selectedCaregiver,
        selectedService,
        selectedHospital,
        selectedArea,
        serviceType,
      });
    }
  };

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation?.goBack()}>
            <Icon name="arrow-back" size={22} color={INK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Hospital</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          Choose the hospital where you want to get care
        </Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.searchSection}>
            <SearchableDropdown
              data={bangladeshDistricts}
              label="District"
              placeholder="Select district"
              value={district}
              onSelect={setDistrict}
              icon="location"
              variant="pill"
              containerStyle={styles.dropdownContainer}
            />
            <SearchableDropdown
              data={bangladeshCities}
              label="City"
              placeholder="Select city"
              value={city}
              onSelect={setCity}
              icon="business-outline"
              variant="pill"
              containerStyle={styles.dropdownContainer}
            />
          </View>

          {isLoading ? (
            <HospitalSkeleton />
          ) : hospitals.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="medkit-outline" size={64} color="#E3E8F0" />
              <Text style={styles.emptyTitle}>No Hospitals Found</Text>
              <Text style={styles.emptyText}>Try adjusting your filters</Text>
            </View>
          ) : (
            <View style={styles.hospitalGrid}>
              {hospitals.map(hospital => {
                const isSelected = selectedHospital?.id === hospital.id;
                const locationLine = [hospital.thana, hospital.district]
                  .filter(Boolean)
                  .join(', ');
                const photo =
                  hospital.photo || hospital.image || hospital.profile_photo;
                const consultationFee =
                  hospital.consultation_fee ?? hospital.fee ?? hospital.estimated_fee ?? 0;
                const isVerified = hospital.is_verified || hospital.is_active;

                return (
                  <TouchableOpacity
                    key={hospital.id}
                    activeOpacity={0.85}
                    style={[
                      styles.hospitalCard,
                      isSelected && styles.selectedCard,
                    ]}
                    onPress={() => setSelectedHospital(hospital)}>
                    <View style={styles.cardHeader}>
                      {photo ? (
                        <Image source={{uri: photo}} style={styles.hospitalImage} />
                      ) : (
                        <View style={styles.placeholderAvatar}>
                          <Icon name="business" size={28} color={TEAL} />
                        </View>
                      )}

                      <View style={styles.userInfo}>
                        {isVerified ? (
                          <View style={styles.verifiedBadge}>
                            <Icon name="checkmark-circle" size={13} color={TEAL} />
                            <Text style={styles.verifiedText}>Verified</Text>
                          </View>
                        ) : null}

                        <Text style={styles.name} numberOfLines={2}>
                          {hospital.name}
                        </Text>

                        <View style={styles.infoRow}>
                          <Icon name="star" size={13} color="#F6A900" />
                          <Text style={styles.infoText}>
                            {formatRating(hospital.rating)}
                            {hospital.completed_bookings != null
                              ? ` (${hospital.completed_bookings})`
                              : ' (0)'}
                            {hospital.type ? `  ·  ${hospital.type}` : ''}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Icon name="location-outline" size={13} color={MUTED} />
                          <Text style={styles.infoText} numberOfLines={1}>
                            {locationLine || hospital.address || 'No location'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {!!hospital.address && (
                      <View style={styles.addressRow}>
                        <Icon name="notifications-outline" size={15} color={MUTED} />
                        <Text style={styles.addressText} numberOfLines={2}>
                          {hospital.address}
                        </Text>
                      </View>
                    )}

                    <View style={styles.cardFooter}>
                      <View style={styles.statBlock}>
                        <View style={styles.statIcon}>
                          <Icon name="star-outline" size={15} color={TEAL} />
                        </View>
                        <View>
                          <Text style={styles.statLabel}>Rating</Text>
                          <Text style={styles.statValue}>
                            {formatRating(hospital.rating)}
                            <Text style={styles.statSuffix}> / 5.0</Text>
                          </Text>
                        </View>
                      </View>

                      <View style={styles.statBlock}>
                        <View style={styles.statIcon}>
                          <Icon name="cash-outline" size={15} color={TEAL} />
                        </View>
                        <View>
                          <Text style={styles.statLabel}>Consultation Fee</Text>
                          <Text style={styles.statValue}>
                            ৳{formatMoney(consultationFee)}
                            <Text style={styles.statSuffix}> (est.)</Text>
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.selectPill,
                          isSelected && styles.selectPillActive,
                        ]}>
                        <Text style={styles.selectPillText}>
                          {isSelected ? 'Selected' : 'Select'}
                        </Text>
                        {!isSelected ? (
                          <Icon name="arrow-forward" size={14} color="#FFFFFF" />
                        ) : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.bottomContainer,
            {paddingBottom: Math.max(16, insets.bottom + 8)},
          ]}>
          <PrimaryButton
            title="Next"
            onPress={handleNext}
            disabled={!selectedHospital}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default HospitalSelection;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    minHeight: 44,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: INK,
  },
  headerSpacer: {
    width: 36,
  },
  headerSubtitle: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
    textAlign: 'left',
  },
  searchSection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
    zIndex: 30,
  },
  dropdownContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: INK,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: MUTED,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  hospitalGrid: {
    flexDirection: 'column',
  },
  hospitalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EEEC',
    marginBottom: 12,
  
  },
  selectedCard: {
    borderColor: TEAL,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hospitalImage: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: '#E8EEEC',
    marginRight: 12,
  },
  placeholderAvatar: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: '#E8F6F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#E8F6F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAL,
  },
  name: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: INK,
    marginBottom: 4,
  },
  infoRow: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoText: {
    marginLeft: 5,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: MUTED,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F3',
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: MUTED,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E8F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: MUTED,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
  },
  statSuffix: {
    fontSize: 11,
    fontWeight: '500',
    color: MUTED,
  },
  selectPill: {
    minWidth: 86,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  selectPillActive: {
    backgroundColor: TEAL,
  },
  selectPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  nextButton: {
    backgroundColor: TEAL,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  disabledButton: {
    backgroundColor: '#C5CDD6',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
