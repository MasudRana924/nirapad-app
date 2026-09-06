import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSearchHospitals} from '../api/queries';
import Header from '../components/common/Header';
import HospitalSkeleton from '../components/home/HospitalSkeleton';
import SearchableDropdown from '../components/common/SearchableDropdown';
import {bangladeshDistricts, bangladeshCities} from '../data/bangladeshLocations';
import {storage} from '../utils/storage';

const HospitalSelection = ({navigation, route}) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const {selectedMember, selectedCaregiver} = route.params || {};

  const {data: hospitalsData, isLoading} = useSearchHospitals({
    district,
    city,
  });

  const hospitals = hospitalsData?.data || [];

  const handleNext = () => {
    if (selectedHospital) {
      storage.saveSelectedHospital(selectedHospital);
      navigation?.navigate('BookingDateTime', {
        selectedMember,
        selectedCaregiver,
        selectedHospital,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Select Hospital" onBack={() => navigation?.goBack()} />

      {/* ================= SEARCH FILTERS ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <SearchableDropdown
            data={bangladeshDistricts}
            label="District"
            placeholder="Select district"
            value={district}
            onSelect={setDistrict}
            icon="location-outline"
            containerStyle={styles.dropdownContainer}
          />
          <SearchableDropdown
            data={bangladeshCities}
            label="City"
            placeholder="Select city"
            value={city}
            onSelect={setCity}
            icon="business-outline"
            containerStyle={styles.dropdownContainer}
          />
        </View>

        {/* ================= HOSPITAL LIST ================= */}
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
          {hospitals.map(hospital => (
            <TouchableOpacity
              key={hospital.id}
              activeOpacity={0.85}
              style={[
                styles.hospitalCard,
                selectedHospital?.id === hospital.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedHospital(hospital)}>
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="medkit" size={24} color="#19B57A" />
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <View style={styles.nameRow}>
                    <Text style={styles.hospitalName}>{hospital.name}</Text>
                    {hospital.is_verified && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Verified</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.locationText}>
                    {hospital.address} · {hospital.city}, {hospital.district}
                  </Text>
                  <Text style={styles.typeText}>{hospital.type}</Text>
                </View>

                <View style={styles.ratingSection}>
                  <Text style={styles.ratingText}>{hospital.rating}</Text>
                  <Icon name="star" size={16} color="#F6A900" />
                </View>
              </View>
            </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ================= NEXT BUTTON ================= */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.nextButton,
            !selectedHospital && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!selectedHospital}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Icon name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HospitalSelection;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ================= SEARCH SECTION =================
  searchSection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },

  dropdownContainer: {
    flex: 1,
  },

  // ================= EMPTY STATE =================
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#172333',
    marginTop: 16,
  },

  emptyText: {
    fontSize: 14,
    color: '#8190A7',
    marginTop: 8,
  },

  // ================= SCROLL =================
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // ================= HOSPITAL GRID =================
  hospitalGrid: {
    flexDirection: 'column',
  },

  hospitalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  selectedCard: {
    borderColor: '#008178',
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  cardLeft: {
    marginRight: 12,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardRight: {
    flex: 1,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  hospitalName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#172333',
    marginRight: 8,
  },

  popularBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  popularText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#19B57A',
  },

  locationText: {
    fontSize: 13,
    color: '#8190A7',
  },

  typeText: {
    fontSize: 12,
    color: '#008178',
    fontWeight: '500',
    marginTop: 2,
  },

  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },

  ratingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#172333',
    marginRight: 4,
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

  nextButton: {
    backgroundColor: '#008178',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  disabledButton: {
    backgroundColor: '#B5C0D0',
  },

  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
