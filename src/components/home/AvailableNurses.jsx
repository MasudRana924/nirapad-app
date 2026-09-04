import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const NURSES = [
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

const AvailableNurses = ({navigation}) => {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Nurses</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('SelectNurse')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {NURSES.map(nurse => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={nurse.id}
            style={styles.row}
            onPress={() => navigation?.navigate('NurseDetails', {nurse})}>
            <Image source={{uri: nurse.image}} style={styles.avatar} />

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{nurse.name}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>{nurse.status}</Text>
                </View>
              </View>

              <Text style={styles.specialty}>
                {nurse.specialty} • {nurse.experience}
              </Text>

              <View style={styles.ratingRow}>
                <Icon name="star" size={12} color="#F6A900" />
                <Text style={styles.ratingText}>
                  {nurse.rating} ({nurse.reviews} reviews)
                </Text>
              </View>
            </View>

            <View style={styles.chevron}>
              <Icon name="chevron-forward" size={18} color="#0d9488" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default AvailableNurses;

const styles = StyleSheet.create({
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

  list: {
    gap: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 14,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  name: {
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

  specialty: {
    fontSize: 12,
    color: '#8190A7',
    marginTop: 3,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#172333',
    marginLeft: 4,
  },

  chevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
