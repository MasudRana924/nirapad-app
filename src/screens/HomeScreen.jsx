import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen = ({navigation}) => {
  const services = [
    {id: 1, name: 'Caregiver', icon: 'account-heart', color: '#2474D4'},
    {id: 2, name: 'Nurse', icon: 'needle', color: '#16B890'},
    {id: 3, name: 'Attendant', icon: 'hospital-box', color: '#E67E22'},
    {id: 4, name: 'Physiotherapy', icon: 'human-handsup', color: '#9B59B6'},
  ];

  const familyMembers = [
    {
      id: 1,
      name: 'Abul Hossain',
      relation: 'Father',
      age: '72',
      avatar: '👴',
    },
    {
      id: 2,
      name: 'Farida Begum',
      relation: 'Mother',
      age: '68',
      avatar: '👵',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Evening 👋</Text>
            <Text style={styles.userName}>Rafiq Hossain</Text>
          </View>

          <TouchableOpacity activeOpacity={0.7} style={styles.notifButton}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#182331" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity activeOpacity={0.8} style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color="#8290A8" />
          <Text style={styles.searchPlaceholder}>Search services, caregivers...</Text>
        </TouchableOpacity>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Professional Care</Text>
            <Text style={styles.bannerSubtitle}>for Your Family</Text>
            <Text style={styles.bannerDesc}>
              Book verified caregivers and nurses anytime.
            </Text>
            <TouchableOpacity activeOpacity={0.8} style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerIconContainer}>
            <MaterialCommunityIcons name="heart-pulse" size={64} color="rgba(255,255,255,0.25)" />
          </View>
        </View>

        {/* Services */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {services.map(service => (
            <TouchableOpacity
              key={service.id}
              activeOpacity={0.8}
              style={styles.serviceCard}>
              <View style={[styles.serviceIconBg, {backgroundColor: service.color + '15'}]}>
                <MaterialCommunityIcons
                  name={service.icon}
                  size={28}
                  color={service.color}
                />
              </View>
              <Text style={styles.serviceName}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Helping Hand */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Helping Hand</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('SelectCaregiver')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.familyContainer}>
          {familyMembers.map(member => (
            <TouchableOpacity
              key={member.id}
              activeOpacity={0.8}
              style={styles.familyCard}>
              <View style={styles.familyAvatar}>
                <Text style={styles.familyAvatarText}>{member.avatar}</Text>
              </View>
              <Text style={styles.familyName}>{member.name}</Text>
              <Text style={styles.familyRelation}>
                {member.relation} · {member.age} yrs
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addFamilyCard}
            onPress={() => navigation?.navigate('SelectCaregiver')}>
            <MaterialCommunityIcons name="plus" size={28} color="#2474D4" />
            <Text style={styles.addFamilyText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Bookings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyBooking}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#C8D0DC" />
          <Text style={styles.emptyText}>No recent bookings</Text>
          <Text style={styles.emptySubtext}>Your booking history will appear here</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 8,
  },

  greeting: {
    fontSize: 15,
    color: '#7D8BA5',
    fontWeight: '400',
  },

  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#182331',
    marginTop: 2,
    letterSpacing: -0.3,
  },

  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF1F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
  },

  // Search
  searchBar: {
    marginHorizontal: 24,
    marginTop: 18,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EFF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 15,
    color: '#8290A8',
    fontWeight: '400',
  },

  // Banner
  banner: {
    marginHorizontal: 24,
    marginTop: 22,
    borderRadius: 20,
    backgroundColor: '#2474D4',
    padding: 24,
    flexDirection: 'row',
    overflow: 'hidden',
  },

  bannerContent: {
    flex: 1,
  },

  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  bannerSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  bannerDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
    lineHeight: 19,
  },

  bannerButton: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  bannerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2474D4',
  },

  bannerIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#182331',
  },

  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2474D4',
  },

  // Services Grid
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    justifyContent: 'space-between',
  },

  serviceCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },

  serviceIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#182331',
  },

  // Empty
  emptyBooking: {
    alignItems: 'center',
    paddingVertical: 36,
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8290A8',
    marginTop: 12,
  },

  emptySubtext: {
    fontSize: 14,
    color: '#A8B3C4',
    marginTop: 4,
  },

  // Family Container
  familyContainer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginBottom: 14,
  },

  familyCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    marginRight: 10,
  },

  familyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDF1F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  familyAvatarText: {
    fontSize: 28,
  },

  familyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#182331',
    marginBottom: 3,
  },

  familyRelation: {
    fontSize: 11,
    color: '#7D8BA5',
    textAlign: 'center',
  },

  addFamilyCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
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
