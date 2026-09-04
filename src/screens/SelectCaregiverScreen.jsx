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
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const caregivers = [
  {
    id: 1,
    name: 'Rahim Ahmed',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: '4.9',
    jobs: '142 jobs',
    experience: '4 yrs',
    distance: '2.3 km',
    price: '৳800',
    tags: ['Hospital', 'Elderly'],
  },
  {
    id: 2,
    name: 'Fatema Khanam',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: '4.8',
    jobs: '98 jobs',
    experience: '3 yrs',
    distance: '3.1 km',
    price: '৳750',
    tags: ['Home Care', 'Nursing Asst.'],
  },
  {
    id: 3,
    name: 'Karim Mia',
    image: 'https://randomuser.me/api/portraits/men/52.jpg',
    rating: '4.7',
    jobs: '210 jobs',
    experience: '6 yrs',
    distance: '4.5 km',
    price: '৳900',
    tags: ['Hospital', 'Transport'],
  },
  {
    id: 4,
    name: 'Sumaiya Begum',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: '4.6',
    jobs: '67 jobs',
    experience: '2 yrs',
    distance: '1.8 km',
    price: '৳650',
    tags: ['Elderly', 'Companion'],
  },
];

const filters = [
  'Available',
  'Top Rated',
  'Female',
  'Nearby',
  'Budget',
];

const SelectCaregiverScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('Available');
  const [search, setSearch] = useState('');
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const {selectedMember} = route.params || {};

  const filteredCaregivers = caregivers.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleNext = () => {
    if (selectedCaregiver) {
      navigation?.navigate('HospitalSelection', {
        selectedMember,
        selectedCaregiver,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={() => navigation?.goBack()}>
          <Icon name="arrow-back" size={27} color="#182331" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Select Caregiver</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, {paddingBottom: 100 + insets.bottom}]}>
        {/* ================= SEARCH ================= */}

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="search" size={23} color="#7D8BA5" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search caregivers..."
              placeholderTextColor="#7D8BA5"
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity activeOpacity={0.85} style={styles.filterButton}>
            <Icon name="options-outline" size={23} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ================= FILTER CHIPS ================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {filters.map(filter => {
            const selected = selectedFilter === filter;

            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(filter)}
                style={[styles.filterChip, selected && styles.filterChipActive]}>
                <Text style={[styles.filterText, selected && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ================= RESULT HEADER ================= */}

        <View style={styles.resultHeader}>
          <Text style={styles.availableText}>24 caregivers available</Text>

          <TouchableOpacity activeOpacity={0.7} style={styles.sortButton}>
            <Icon name="swap-vertical" size={19} color="#1473DC" />

            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* ================= CAREGIVER LIST ================= */}

        <View style={styles.caregiverList}>
          {filteredCaregivers.map(caregiver => (
            <TouchableOpacity
              key={caregiver.id}
              activeOpacity={0.9}
              style={[
                styles.caregiverCard,
                selectedCaregiver?.id === caregiver.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedCaregiver(caregiver)}>
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="person" size={24} color="#2478D4" />
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <View style={styles.nameRow}>
                    <Text style={styles.caregiverName}>{caregiver.name}</Text>
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableBadgeText}>Available</Text>
                    </View>
                  </View>

                  <Text style={styles.locationText}>
                    {caregiver.experience} · {caregiver.distance}
                  </Text>
                </View>

                <View style={styles.ratingSection}>
                  <Text style={styles.ratingText}>{caregiver.rating}</Text>
                  <Icon name="star" size={16} color="#F6A900" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ================= NEXT BUTTON ================= */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.nextButton,
            !selectedCaregiver && styles.disabledButton,
          ]}
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

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 18,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#11182e',
    flex: 1,
    textAlign: 'center',
  },

  // =====================================================
  // SCROLL
  // =====================================================

  scrollContent: {
    paddingTop: 14,
    paddingHorizontal: 19,
    paddingBottom: 100,
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
    backgroundColor: '#2478D4',
    borderColor: '#2478D4',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
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
    borderRadius: 24,
    backgroundColor: '#EAF2FE',
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

  caregiverName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#172333',
    marginRight: 8,
  },

  availableBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  availableBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#19B57A',
  },

  locationText: {
    fontSize: 13,
    color: '#8190A7',
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

  // =====================================================
  // SELECTION STYLES
  // =====================================================

  selectedCard: {
    borderWidth: 1,
    borderColor: '#2478D4',
  },

  // =====================================================
  // BOTTOM BUTTON
  // =====================================================

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
    backgroundColor: '#2478D4',
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
