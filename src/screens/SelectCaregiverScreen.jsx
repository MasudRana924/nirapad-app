import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSearchCaregivers} from '../api/queries';
import Header from '../components/common/Header';
import {storage} from '../utils/storage';

const SelectCaregiverScreen = ({navigation, route}) => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const {selectedMember} = route.params || {};

  const filters = [
    {id: 'all', label: 'All'},
    {id: 'male', label: 'Male'},
    {id: 'female', label: 'Female'},
  ];

  const {data: caregiversData, isLoading} = useSearchCaregivers({
    name: search,
    location,
    gender: selectedFilter === 'all' ? '' : selectedFilter,
  });

  const caregivers = caregiversData?.data || [];

  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId === selectedFilter ? '' : filterId);
  };

  const handleSearch = (text) => {
    setSearch(text);
  };

  const handleNext = () => {
    if (selectedCaregiver) {
      storage.saveSelectedCaregiver(selectedCaregiver);
      navigation?.navigate('HospitalSelection', {
        selectedMember,
        selectedCaregiver,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Select Caregiver" onBack={() => navigation?.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        {/* ================= SEARCH ================= */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="search" size={23} color="#7D8BA5" />
            <TextInput
              value={search}
              onChangeText={handleSearch}
              placeholder="Search by name..."
              placeholderTextColor="#7D8BA5"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.filterButton}>
            <Icon name="options-outline" size={23} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Location Filter */}
        <View style={styles.locationFilter}>
          <Icon name="location-outline" size={18} color="#7D8BA5" />
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Filter by location..."
            placeholderTextColor="#7D8BA5"
            style={styles.locationInput}
          />
        </View>

        {/* ================= FILTER CHIPS ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {filters.map(filter => {
            const selected = selectedFilter === filter.id;

            return (
              <TouchableOpacity
                key={filter.id}
                activeOpacity={0.8}
                onPress={() => handleFilterSelect(filter.id)}
                style={[styles.filterChip, selected && styles.filterChipActive]}>
                <Text style={[styles.filterText, selected && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ================= RESULT HEADER ================= */}
        <View style={styles.resultHeader}>
          <Text style={styles.availableText}>{caregivers.length} caregivers available</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.sortButton}>
            <Icon name="swap-vertical" size={19} color="#1473DC" />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* ================= CAREGIVER LIST ================= */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : caregivers.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={64} color="#E3E8F0" />
            <Text style={styles.emptyTitle}>No Caregivers Found</Text>
            <Text style={styles.emptyText}>Try adjusting your filters</Text>
          </View>
        ) : (
          <View style={styles.caregiverList}>
            {caregivers.map(caregiver => (
              <TouchableOpacity
              key={caregiver.id}
              activeOpacity={0.9}
              style={[
                styles.caregiverCard,
                selectedCaregiver?.id === caregiver.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedCaregiver(caregiver)}>
              {/* Top Section */}
              <View style={styles.topSection}>
                <View style={styles.imageContainer}>
                  {caregiver.profile_photo ? (
                    <Image source={{uri: caregiver.profile_photo}} style={styles.profileImage} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Icon name="person" size={24} color="#8190A7" />
                    </View>
                  )}
                  {caregiver.is_available && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.mainInfo}>
                  <View style={styles.nameRow}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.name} numberOfLines={1}>
                        {caregiver.name}
                      </Text>
                    </View>
                    {caregiver.is_available && (
                      <View style={styles.availableBadge}>
                        <Text style={styles.availableText}>Available</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.title}>{caregiver.bio || 'Caregiver'}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Icon name="star" size={16} color="#F59E0B" />
                      <Text style={styles.ratingText}>{caregiver.rating}</Text>
                      <Text style={styles.reviewText}>({caregiver.completed_bookings})</Text>
                    </View>
                    <View style={styles.separator}>•</View>
                    <View style={styles.statItem}>
                      <Icon name="briefcase-outline" size={15} color="#1E293B" />
                      <Text style={styles.statText}>{caregiver.experience_years} yrs exp</Text>
                    </View>
                    <View style={styles.separator}>•</View>
                  </View>
                  <View style={styles.tripsRow}>
                    <Icon name="add-square-outline" size={15} color="#008F72" />
                    <Text style={styles.tripsText}>{caregiver.service_areas?.join(', ') || 'No location'}</Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              {caregiver.bio && (
                <View style={styles.descriptionBox}>
                  <Text style={styles.description}>{caregiver.bio}</Text>
                </View>
              )}

              {/* Bottom Price Section */}
              <View style={styles.bottomSection}>
                <View style={styles.priceContainer}>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{caregiver.price}</Text>
                    <Text style={styles.perHour}>/ hr</Text>
                  </View>
                  <Text style={styles.estimatedPrice}>
                    {caregiver.estimated} for 3 hrs estimated
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={[
                    styles.selectButton,
                    selectedCaregiver?.id === caregiver.id && styles.selectedButton,
                  ]}>
                  <Text
                    style={[
                      styles.selectText,
                      selectedCaregiver?.id === caregiver.id && styles.selectedButtonText,
                    ]}>
                    {selectedCaregiver?.id === caregiver.id ? 'Selected' : 'Select'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ================= BOTTOM BUTTON ================= */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.nextButton, !selectedCaregiver && styles.disabledButton]}
          onPress={handleNext}
          disabled={!selectedCaregiver}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Icon name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SelectCaregiverScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  // ================= LOADING =================
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

  // =====================================================
  // SCROLL
  // =====================================================

  scrollContent: {
    paddingTop: 14,
    paddingHorizontal: 19,
    paddingBottom: 24,
  },

  // =====================================================
  // SEARCH
  // =====================================================

  searchRow: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchBox: {
    flex: 1,
    height: 48,
    borderRadius: 25,
    backgroundColor: '#F0F2F7',
    borderWidth: 1,
    borderColor: '#E0E5EE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    paddingVertical: 0,
    color: '#273447',
    fontSize: 16,
  },

  filterButton: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: '#1473DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },

  // ================= LOCATION FILTER =================
  locationFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
  },

  locationInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#172333',
  },

  // =====================================================
  // FILTERS
  // =====================================================

  filterScroll: {
    paddingTop: 13,
    paddingBottom: 2,
    paddingRight: 10,
  },

  filterChip: {
    height: 36,
    borderRadius: 19,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  filterChipActive: {
    backgroundColor: '#008178',
    borderColor: '#008178',
  },

  filterText: {
    fontSize: 13,
    color: '#7D8BA5',
    fontWeight: '500',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  // =====================================================
  // RESULT HEADER
  // =====================================================

  resultHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  availableText: {
    fontSize: 14,
    color: '#7D8BA5',
    fontWeight: '400',
  },

  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sortText: {
    color: '#1473DC',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 3,
  },

  // =====================================================
  // CAREGIVER LIST
  // =====================================================

  caregiverList: {
    flexDirection: 'column',
  },

  caregiverCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F1F4',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: '#008178',
  },

  // ================= TOP SECTION =================
  topSection: {
    flexDirection: 'row',
    width: '100%',
    minHeight: 88,
  },

  imageContainer: {
    width: 67,
    height: 67,
    position: 'relative',
    marginRight: 13,
  },

  profileImage: {
    width: 67,
    height: 67,
    borderRadius: 34,
    backgroundColor: '#E5E7EB',
  },

  placeholderImage: {
    width: 67,
    height: 67,
    borderRadius: 34,
    backgroundColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  onlineDot: {
    position: 'absolute',
    right: -3,
    bottom: -2,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#13C875',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  mainInfo: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  nameContainer: {
    flex: 1,
    paddingRight: 6,
  },

  name: {
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '600',
    color: '#101820',
  },

  availableBadge: {
    height: 22,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: '#EDF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  availableText: {
    fontSize: 11,
    lineHeight: 14,
    color: '#43658B',
    fontWeight: '500',
  },

  title: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
    color: '#008F72',
    marginTop: 0,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 22,
    marginTop: 1,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    fontSize: 12,
    color: '#17202A',
    marginLeft: 3,
    fontWeight: '500',
  },

  reviewText: {
    fontSize: 12,
    color: '#17202A',
    marginLeft: 2,
  },

  statText: {
    fontSize: 12,
    color: '#17202A',
    marginLeft: 4,
  },

  separator: {
    fontSize: 13,
    color: '#27313D',
    marginHorizontal: 7,
  },

  tripsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 19,
    marginTop: 1,
  },

  tripsText: {
    fontSize: 13,
    lineHeight: 17,
    color: '#008F72',
    marginLeft: 5,
    fontWeight: '500',
  },

  // ================= DESCRIPTION BOX =================
  descriptionBox: {
    width: '100%',
    backgroundColor: '#EEF3FF',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 10,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#17283D',
    fontWeight: '400',
  },

  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  languageText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#26364A',
    marginLeft: 5,
    fontWeight: '400',
  },

  // ================= BOTTOM SECTION =================
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  priceContainer: {
    justifyContent: 'center',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  price: {
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '700',
    color: '#101820',
  },

  perHour: {
    fontSize: 12,
    color: '#26313C',
    marginLeft: 3,
  },

  estimatedPrice: {
    fontSize: 11,
    lineHeight: 15,
    color: '#26313C',
    marginTop: 0,
  },

  selectButton: {
    width: 86,
    height: 47,
    borderRadius: 12,
    backgroundColor: '#DDE9FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  selectedButton: {
    backgroundColor: '#008178',
  },

  selectText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#102238',
    fontWeight: '500',
  },

  selectedButtonText: {
    color: '#FFFFFF',
  },

  // =====================================================
  // BOTTOM BUTTON
  // =====================================================

  bottomContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
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
