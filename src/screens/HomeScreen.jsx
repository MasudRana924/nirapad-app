import React from 'react';
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

const HomeScreen = ({navigation}) => {
  const quickServices = [
    {
      title: 'Hospital',
      icon: 'business',
    },
    {
      title: 'Book Nurse',
      icon: 'fitness',
    },
    {
      title: 'Elderly Care',
      icon: 'heart-outline',
    },
    {
      title: 'Medicine',
      icon: 'medkit-outline',
    },
    {
      title: 'Reports',
      icon: 'document-text-outline',
    },
    {
      title: 'Doctor',
      icon: 'person-outline',
    },
    {
      title: 'Physio',
      icon: 'pulse',
    },
    {
      title: 'More',
      icon: 'grid-outline',
    },
  ];

  const topCaregivers = [
    {
      id: 1,
      name: 'David Miller',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: '4.9',
      specialty: 'Elder Care Specialist',
      price: '$25/hr',
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: '4.8',
      specialty: 'Home Assistant',
      price: '$22/hr',
    },
    {
      id: 3,
      name: 'Karim Mia',
      image: 'https://randomuser.me/api/portraits/men/52.jpg',
      rating: '4.7',
      specialty: 'Child Care Expert',
      price: '$20/hr',
    },
  ];

  const availableNurses = [
    {
      id: 1,
      name: 'Nurse Elena',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      rating: '5.0',
      reviews: 120,
      specialty: 'General Nursing',
      experience: '8 Yrs Exp',
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Nurse Marcus',
      image: 'https://randomuser.me/api/portraits/men/55.jpg',
      rating: '4.9',
      reviews: 85,
      specialty: 'ICU Specialist',
      experience: '5 Yrs Exp',
      status: 'ACTIVE',
    },
    {
      id: 3,
      name: 'Nurse Fatima',
      image: 'https://randomuser.me/api/portraits/women/42.jpg',
      rating: '4.8',
      reviews: 64,
      specialty: 'Pediatric Care',
      experience: '6 Yrs Exp',
      status: 'ACTIVE',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <View>
            <Text style={styles.goodMorning}>Good morning</Text>

            <Text style={styles.userName}>Nadia Rahman</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Notification */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.notificationButton}>
              <Icon name="notifications-outline" size={21} color="#172333" />

              <View style={styles.notificationDot} />
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.profileButton}>
              <Image
                source={{
                  uri: 'https://randomuser.me/api/portraits/women/44.jpg',
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= BOOKING CARD ================= */}

        <View style={styles.bookingCard}>
          <View style={styles.bookingTop}>
            <Text style={styles.bookingLabel}>Active Booking</Text>

            <View style={styles.onWayBadge}>
              <Text style={styles.onWayText}>On the Way</Text>
            </View>
          </View>

          <Text style={styles.bookingTitle}>Hospital Assistance</Text>

          <Text style={styles.bookingPerson}>Abul Hossain (Father)</Text>

          <View style={styles.locationRow}>
            <Icon name="location-sharp" size={14} color="#FFFFFF" />

            <Text style={styles.locationText}>Square Hospital, Dhaka</Text>
          </View>

          <View style={styles.bookingBottom}>
            <View style={styles.bookingPeople}>
              <View style={styles.avatarWhite}>
                <Icon name="person" size={22} color="#B5C0D0" />
              </View>

              <Text style={styles.caregiverName}>Rahim Ahmed</Text>
            </View>

            <View style={styles.morePeople}>
              <View style={styles.smallWhiteCircle} />
              <View style={styles.smallWhiteCircle} />
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.trackLive}>
              Track Live <Text style={styles.externalIcon}>↗</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= BOOKING BUTTONS ================= */}
        <View style={styles.bookingButtonsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bookingButton}
            onPress={() => navigation?.navigate('SelectFamilyMember')}>
            <Icon name="person-add" size={20} color="#008178" />
            <Text style={styles.bookingButtonText}>Book Caregiver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bookingButton}
            onPress={() => navigation?.navigate('SelectFamilyMember')}>
            <Icon name="medical" size={20} color="#008178" />
            <Text style={styles.bookingButtonText}>Book Nurse</Text>
          </TouchableOpacity>
        </View>

        {/* ================= QUICK SERVICES ================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Services</Text>
        </View>

        <View style={styles.servicesGrid}>
          {quickServices.map((service, index) => (
            <TouchableOpacity
              activeOpacity={0.75}
              key={index}
              style={styles.serviceItem}
              onPress={() => {
                if (service.title === 'Elderly Care') {
                  navigation?.navigate('SelectCaregiver');
                } else if (service.title === 'Book Nurse') {
                  navigation?.navigate('SelectNurse');
                } else if (service.title === 'Medicine') {
                  navigation?.navigate('Medicine');
                }
              }}>
              <View style={styles.serviceIcon}>
                <Icon name={service.icon} size={24} color="#1473DC" />
              </View>

              <Text style={styles.serviceText}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= TOP CAREGIVERS ================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Caregivers</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('AllCaregivers')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.caregiverScroll}>
          {topCaregivers.map(caregiver => (
            <TouchableOpacity
              activeOpacity={0.85}
              key={caregiver.id}
              style={styles.caregiverCard}
              onPress={() =>
                navigation?.navigate('CaregiverDetails', {caregiver})
              }>
              <View style={styles.caregiverImageContainer}>
                <Image source={{uri: caregiver.image}} style={styles.caregiverImage} />
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={10} color="#F6A900" />
                  <Text style={styles.ratingBadgeText}>{caregiver.rating}</Text>
                </View>
              </View>

              <Text style={styles.cgCardName}>{caregiver.name}</Text>
              <Text style={styles.cgCardSpecialty}>{caregiver.specialty}</Text>

              <View style={styles.cgCardBottom}>
                <Text style={styles.cgCardPrice}>{caregiver.price}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.profileBtn}
                  onPress={() =>
                    navigation?.navigate('CaregiverDetails', {caregiver})
                  }>
                  <Text style={styles.profileBtnText}>PROFILE</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ================= AVAILABLE NURSES ================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Nurses</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('SelectNurse')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nurseListContainer}>
          {availableNurses.map(nurse => (
            <TouchableOpacity
              activeOpacity={0.85}
              key={nurse.id}
              style={styles.nurseRow}
              onPress={() => navigation?.navigate('NurseDetails', {nurse})}>
              <Image source={{uri: nurse.image}} style={styles.nurseAvatar} />

              <View style={styles.nurseInfo}>
                <View style={styles.nurseNameRow}>
                  <Text style={styles.nurseName}>{nurse.name}</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{nurse.status}</Text>
                  </View>
                </View>

                <Text style={styles.nurseSpecialty}>
                  {nurse.specialty} • {nurse.experience}
                </Text>

                <View style={styles.nurseRatingRow}>
                  <Icon name="star" size={12} color="#F6A900" />
                  <Text style={styles.nurseRatingText}>
                    {nurse.rating} ({nurse.reviews} reviews)
                  </Text>
                </View>
              </View>

              <View style={styles.nurseChevron}>
                <Icon name="chevron-forward" size={18} color="#0d9488" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 85,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  goodMorning: {
    fontSize: 12,
    lineHeight: 17,
    color: '#8190A7',
    fontWeight: '400',
  },

  userName: {
    fontSize: 20,
    lineHeight: 25,
    color: '#172333',
    fontWeight: '700',
    marginTop: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  notificationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E34242',
    right: 5,
    top: 4,
  },

  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },

  profileImage: {
    width: '100%',
    height: '100%',
  },

  // =====================================================
  // BOOKING
  // =====================================================

  bookingCard: {
    backgroundColor: '#2d836f',
    borderRadius: 18,
    padding: 13,
    marginTop: 13,
    minHeight: 166,
  },

  bookingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bookingLabel: {
    fontSize: 11,
    color: '#DCEBFC',
  },

  onWayBadge: {
    backgroundColor: '#FFB900',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  onWayText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },

  bookingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    marginTop: 8,
  },

  bookingPerson: {
    color: '#DCEBFC',
    fontSize: 10.5,
    marginTop: 2,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  locationText: {
    color: '#DCEBFC',
    fontSize: 10.5,
    marginLeft: 3,
  },

  bookingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  bookingPeople: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarWhite: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  caregiverName: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '600',
    marginLeft: 6,
  },

  morePeople: {
    flexDirection: 'row',
    gap: 7,
  },

  smallWhiteCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  trackLive: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
    textDecorationLine: 'underline',
    marginTop: 7,
  },

  externalIcon: {
    textDecorationLine: 'none',
  },

  // =====================================================
  // TOP CAREGIVERS CARDS (new design)
  // =====================================================

  caregiverScroll: {
    paddingRight: 5,
  },

  caregiverCard: {
    width: 170,
    backgroundColor: '#F6F8FA',
    borderRadius: 16,
    alignItems: 'flex-start',
    paddingBottom: 14,
    marginRight: 12,
    overflow: 'hidden',
  },

  caregiverImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },

  caregiverImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  ratingBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },

  ratingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#172333',
    marginLeft: 3,
  },

  cgCardName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#172333',
    marginTop: 10,
    paddingHorizontal: 12,
  },

  cgCardSpecialty: {
    fontSize: 11,
    color: '#8190A7',
    marginTop: 2,
    paddingHorizontal: 12,
  },

  cgCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 10,
  },

  cgCardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#008178',
  },

  profileBtn: {
    backgroundColor: '#172333',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  profileBtnText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // =====================================================
  // AVAILABLE NURSES LIST (new design)
  // =====================================================

  nurseListContainer: {
    gap: 10,
  },

  nurseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 14,
  },

  nurseAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },

  nurseInfo: {
    flex: 1,
    marginLeft: 12,
  },

  nurseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  nurseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172333',
  },

  activeBadge: {
    backgroundColor: '#E6F9F1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#19B57A',
  },

  nurseSpecialty: {
    fontSize: 12,
    color: '#8190A7',
    marginTop: 3,
  },

  nurseRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  nurseRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#172333',
    marginLeft: 4,
  },

  nurseChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // =====================================================
  // SECTION
  // =====================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#172333',
  },

  seeAll: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1473DC',
  },

  // =====================================================
  // QUICK SERVICES
  // =====================================================

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  serviceItem: {
    width: '24%',
    alignItems: 'center',
    marginBottom: 9,
  },

  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E9F1FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceText: {
    fontSize: 9.5,
    color: '#172333',
    marginTop: 5,
    textAlign: 'center',
  },

  // =====================================================
  // FAMILY
  // =====================================================

  familyScroll: {
    paddingRight: 5,
  },

  familyCard: {
    width: 121,
    height: 124,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    paddingTop: 10,
    marginRight: 9,
  },

  familyImageWrapper: {
    position: 'relative',
  },

  familyImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#19B57A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  familyName: {
    maxWidth: 105,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '700',
    color: '#172333',
    marginTop: 5,
  },

  familyAge: {
    fontSize: 9.5,
    color: '#8190A7',
    marginTop: 1,
  },

  familyStatus: {
    height: 20,
    minWidth: 100,
    paddingHorizontal: 6,
    borderRadius: 5,
    backgroundColor: '#EAF2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },

  familyStatusText: {
    color: '#1473DC',
    fontSize: 8.5,
    fontWeight: '600',
  },

  // =====================================================
  // ADD FAMILY
  // =====================================================

  addFamilyCard: {
    width: 121,
    height: 124,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  
    borderStyle: 'dashed',
  },

  addFamilyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#008178',
    marginTop: 6,
  },

  // =====================================================
  // BOOKING BUTTONS
  // =====================================================

  bookingButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  bookingButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#008178',
  },

  bookingButtonText: {
    color: '#008178',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
