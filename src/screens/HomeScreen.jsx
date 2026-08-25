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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen = ({navigation}) => {
  const quickServices = [
    {
      title: 'Hospital',
      icon: 'hospital-building',
    },
    {
      title: 'Book Nurse',
      icon: 'stethoscope',
    },
    {
      title: 'Elderly Care',
      icon: 'hand-heart-outline',
    },
    {
      title: 'Medicine',
      icon: 'pill',
    },
    {
      title: 'Reports',
      icon: 'file-document-outline',
    },
    {
      title: 'Doctor',
      icon: 'account-outline',
    },
    {
      title: 'Physio',
      icon: 'pulse',
    },
    {
      title: 'More',
      icon: 'view-grid-outline',
    },
  ];

  const familyMembers = [
    {
      name: 'Abul Hossain',
      relation: 'Father',
      age: '72',
      service: 'At Square Hospital',
      image: 'https://randomuser.me/api/portraits/men/75.jpg',
      online: true,
    },
    {
      name: 'Farida Begum',
      relation: 'Mother',
      age: '68',
      service: 'At Home',
      image: 'https://randomuser.me/api/portraits/women/65.jpg',
      online: false,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
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
              <MaterialCommunityIcons name="bell-outline" size={21} color="#172333" />

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
            <MaterialCommunityIcons name="map-marker" size={14} color="#FFFFFF" />

            <Text style={styles.locationText}>Square Hospital, Dhaka</Text>
          </View>

          <View style={styles.bookingBottom}>
            <View style={styles.bookingPeople}>
              <View style={styles.avatarWhite}>
                <MaterialCommunityIcons name="account" size={22} color="#B5C0D0" />
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
                }
              }}>
              <View style={styles.serviceIcon}>
                <MaterialCommunityIcons name={service.icon} size={24} color="#1473DC" />
              </View>

              <Text style={styles.serviceText}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= MY FAMILY ================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Family</Text>

          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal flexible family list */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.familyScroll}>
          {familyMembers.map((member, index) => (
            <TouchableOpacity
              activeOpacity={0.85}
              key={index}
              style={styles.familyCard}>
              <View style={styles.familyImageWrapper}>
                <Image source={{uri: member.image}} style={styles.familyImage} />

                {member.online && <View style={styles.onlineDot} />}
              </View>

              <Text numberOfLines={1} style={styles.familyName}>
                {member.name}
              </Text>

              <Text style={styles.familyAge}>
                {member.relation} · {member.age} yrs
              </Text>

              <View style={styles.familyStatus}>
                <Text style={styles.familyStatusText}>{member.service}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* ADD FAMILY MEMBER */}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addFamilyCard}
            onPress={() => navigation?.navigate('AddFamilyMember')}>
            <View style={styles.addFamilyIcon}>
              <MaterialCommunityIcons name="plus" size={27} color="#1473DC" />
            </View>

            <Text style={styles.addFamilyTitle}>Add Family</Text>

            <Text style={styles.addFamilySubtitle}>Member</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ================= RECENT ACTIVITY ================= */}

        <View style={[styles.sectionHeader, styles.activityHeader]}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Activity 1 */}
        <TouchableOpacity activeOpacity={0.8} style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={21}
              color="#1473DC"
            />
          </View>

          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Booking Completed</Text>

            <Text style={styles.activityDescription}>Hospital Visit — Square Hospital</Text>
          </View>

          <Text style={styles.activityTime}>Yesterday</Text>
        </TouchableOpacity>

        {/* Activity 2 */}
        <TouchableOpacity activeOpacity={0.8} style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <MaterialCommunityIcons name="file-document-outline" size={21} color="#1473DC" />
          </View>

          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Care Report Ready</Text>

            <Text style={styles.activityDescription}>Post-visit report from Rahim</Text>
            <Text style={styles.activityDescription}>Ahmed</Text>
          </View>

          <Text style={styles.activityTime}>2 days ago</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 25,
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
    backgroundColor: '#2478D4',
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
  // SECTION
  // =====================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 17,
    marginBottom: 9,
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
    borderWidth: 1,
    borderColor: '#E1E6EF',
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
    borderWidth: 1,
    borderColor: '#EDF1F7',
    borderStyle: 'dashed',
  },

  addFamilyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2474D4',
    marginTop: 6,
  },
});
