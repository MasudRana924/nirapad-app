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
    tags: ['Home Care', 'Elderly'],
  },
  {
    id: 3,
    name: 'Karim Mia',
    image: 'https://randomuser.me/api/portraits/men/52.jpg',
    rating: '4.7',
    jobs: '210 jobs',
    experience: '5 yrs',
    distance: '1.8 km',
    price: '৳900',
    tags: ['Hospital', 'Physio'],
  },
  {
    id: 4,
    name: 'Nasrin Akter',
    image: 'https://randomuser.me/api/portraits/women/55.jpg',
    rating: '4.6',
    jobs: '76 jobs',
    experience: '2 yrs',
    distance: '4.2 km',
    price: '৳700',
    tags: ['Home Care', 'Baby'],
  },
  {
    id: 5,
    name: 'Jamal Uddin',
    image: 'https://randomuser.me/api/portraits/men/62.jpg',
    rating: '4.8',
    jobs: '156 jobs',
    experience: '4 yrs',
    distance: '2.9 km',
    price: '৳850',
    tags: ['Hospital', 'Elderly'],
  },
];

const filters = [
  'Available',
  'Top Rated',
  'Female',
  'Nearby',
  'Budget',
];

const AllCaregiversScreen = ({navigation}) => {
  const [selectedFilter, setSelectedFilter] = useState('Available');
  const [search, setSearch] = useState('');

  const filteredCaregivers = caregivers.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation?.goBack()}>
          <Icon name="arrow-back" size={27} color="#182331" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>All Caregivers</Text>
      </View>

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
              onChangeText={setSearch}
              placeholder="Search caregivers..."
              placeholderTextColor="#7D8BA5"
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Icon name="options-outline" size={22} color="#1473DC" />
          </TouchableOpacity>
        </View>

        {/* ================= FILTERS ================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              activeOpacity={0.75}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.activeFilter,
              ]}
              onPress={() => setSelectedFilter(filter)}>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText,
                ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ================= CAREGIVER LIST ================= */}
        <View style={styles.caregiverList}>
          {filteredCaregivers.map(caregiver => (
            <TouchableOpacity
              key={caregiver.id}
              activeOpacity={0.9}
              style={styles.caregiverCard}
              onPress={() =>
                navigation?.navigate('CaregiverDetails', {caregiver})
              }>
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="person" size={24} color="#008178" />
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
    </SafeAreaView>
  );
};

export default AllCaregiversScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172333',
    marginLeft: 16,
  },

  // =====================================================
  // SEARCH
  // =====================================================

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  searchBox: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#172333',
  },

  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#E9F1FC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // =====================================================
  // FILTERS
  // =====================================================

  filtersScroll: {
    marginTop: 16,
    marginBottom: 20,
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    marginRight: 8,
  },

  activeFilter: {
    backgroundColor: '#008178',
  },

  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8190A7',
  },

  activeFilterText: {
    color: '#FFFFFF',
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
    borderRadius: 12,
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
  // SCROLL
  // =====================================================

  scrollContent: {
    paddingTop: 14,
    paddingHorizontal: 19,
    paddingBottom: 30,
  },
});
