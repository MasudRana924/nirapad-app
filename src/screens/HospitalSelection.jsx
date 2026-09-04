import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const HospitalSelection = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const [selectedHospital, setSelectedHospital] = useState(null);
  const {selectedMember, selectedCaregiver} = route.params || {};

  const hospitals = [
    {
      id: 1,
      name: 'Evercare Hospital Dhaka',
      address: 'Bashundhara, Dhaka',
      rating: '4.7',
      distance: '4.5 km away',
      popular: true,
    },
    {
      id: 2,
      name: 'Bangladesh Specialized Hospital',
      address: 'Gulshan-2, Dhaka',
      rating: '4.6',
      distance: '3.2 km away',
      popular: false,
    },
    {
      id: 3,
      name: 'Square Hospital',
      address: 'West Panthapath, Dhaka',
      rating: '4.8',
      distance: '2.5 km away',
      popular: true,
    },
    {
      id: 4,
      name: 'United Hospital',
      address: 'Gulshan-2, Dhaka',
      rating: '4.7',
      distance: '3.2 km away',
      popular: false,
    },
    {
      id: 5,
      name: 'Apollo Hospitals',
      address: 'Bashundhara R/A, Dhaka',
      rating: '4.9',
      distance: '4.1 km away',
      popular: true,
    },
  ];

  const handleNext = () => {
    if (selectedHospital) {
      navigation?.navigate('BookingDateTime', {
        selectedMember,
        selectedCaregiver,
        selectedHospital,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation?.goBack()}>
          <Icon name="arrow-back" size={24} color="#172333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Select Hospital</Text>

        <View style={styles.placeholder} />
      </View>

      {/* ================= HOSPITAL LIST ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: 100 + insets.bottom}]}
        showsVerticalScrollIndicator={false}>
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
                    {hospital.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.locationText}>
                    {hospital.address} · {hospital.distance}
                  </Text>
                </View>

                <View style={styles.ratingSection}>
                  <Text style={styles.ratingText}>{hospital.rating}</Text>
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

  // ================= HEADER =================
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172333',
  },

  placeholder: {
    width: 36,
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
    borderColor: '#2478D4',
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
