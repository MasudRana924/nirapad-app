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
    name: 'Tanzim Ahmed',
    title: 'Senior Patient Escort',
    rating: '4.8',
    reviews: '98',
    experience: '4 yrs exp',
    trips: '120 trips',
    price: '৳380',
    estimated: '৳1,140',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    description:
      'Specialized in orthopedic and geriatric care assistance, wheelchair transit, and prescription & medication management.',
    languages: ['Bengali', 'English'],
    available: true,
  },
  {
    id: 2,
    name: 'Farhana Yasmin',
    title: 'Compassionate Caregiver',
    rating: '4.9',
    reviews: '210',
    experience: '5 yrs exp',
    trips: '240+ trips',
    price: '৳450',
    estimated: '৳1,350',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    description:
      'Deep experience in oncology, post-surgery follow-up appointments, calm communication with anxious patients, and doctor communication assistance.',
    languages: ['Bengali', 'English', 'Hindi'],
    available: true,
  },
  {
    id: 3,
    name: 'Karim Mia',
    title: 'Hospital Escort Specialist',
    rating: '4.7',
    reviews: '142',
    experience: '6 yrs exp',
    trips: '210 trips',
    price: '৳420',
    estimated: '৳1,260',
    image: 'https://randomuser.me/api/portraits/men/52.jpg',
    description:
      'Expert in hospital navigation, appointment coordination, and patient transport. Experienced with elderly and disabled patients.',
    languages: ['Bengali', 'English'],
    available: true,
  },
  {
    id: 4,
    name: 'Sumaiya Begum',
    title: 'Home Care Assistant',
    rating: '4.6',
    reviews: '67',
    experience: '2 yrs exp',
    trips: '87 trips',
    price: '৳350',
    estimated: '৳1,050',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    description:
      'Specialized in home-based care, medication management, and daily living assistance. Patient and compassionate caregiver.',
    languages: ['Bengali'],
    available: true,
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
              {/* Top Section */}
              <View style={styles.topSection}>
                <View style={styles.imageContainer}>
                  <Image source={{uri: caregiver.image}} style={styles.profileImage} />
                  <View style={styles.onlineDot} />
                </View>
                <View style={styles.mainInfo}>
                  <View style={styles.nameRow}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.name} numberOfLines={1}>
                        {caregiver.name}
                      </Text>
                    </View>
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                  </View>
                  <Text style={styles.title}>{caregiver.title}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Icon name="star" size={16} color="#F59E0B" />
                      <Text style={styles.ratingText}>{caregiver.rating}</Text>
                      <Text style={styles.reviewText}>({caregiver.reviews})</Text>
                    </View>
                    <View style={styles.separator}>•</View>
                    <View style={styles.statItem}>
                      <Icon name="briefcase-outline" size={15} color="#1E293B" />
                      <Text style={styles.statText}>{caregiver.experience}</Text>
                    </View>
                    <View style={styles.separator}>•</View>
                  </View>
                  <View style={styles.tripsRow}>
                    <Icon name="add-square-outline" size={15} color="#008F72" />
                    <Text style={styles.tripsText}>{caregiver.trips}</Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.descriptionBox}>
                <Text style={styles.description}>{caregiver.description}</Text>
                <View style={styles.languageRow}>
                  <Icon name="language-outline" size={17} color="#26364A" />
                  <Text style={styles.languageText}>
                    {caregiver.languages.join(', ')}
                  </Text>
                </View>
              </View>

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
    borderRadius: 9,
    backgroundColor: '#E5E7EB',
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
