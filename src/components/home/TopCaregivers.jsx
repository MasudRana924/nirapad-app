import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CAREGIVERS = [
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

const TopCaregivers = ({navigation}) => {
  return (
    <View>
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
        contentContainerStyle={styles.scroll}>
        {CAREGIVERS.map(caregiver => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={caregiver.id}
            style={styles.card}
            onPress={() =>
              navigation?.navigate('CaregiverDetails', {caregiver})
            }>
            <View style={styles.imageContainer}>
              <Image
                source={{uri: caregiver.image}}
                style={styles.image}
              />
              <View style={styles.ratingBadge}>
                <Icon name="star" size={10} color="#F6A900" />
                <Text style={styles.ratingText}>{caregiver.rating}</Text>
              </View>
            </View>

            <Text style={styles.name}>{caregiver.name}</Text>
            <Text style={styles.specialty}>{caregiver.specialty}</Text>

            <View style={styles.bottom}>
              <Text style={styles.price}>{caregiver.price}</Text>
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
    </View>
  );
};

export default TopCaregivers;

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

  scroll: {
    paddingRight: 5,
  },

  card: {
    width: 170,
    backgroundColor: '#F6F8FA',
    borderRadius: 16,
    alignItems: 'flex-start',
    paddingBottom: 14,
    marginRight: 12,
    overflow: 'hidden',
  },

  imageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },

  image: {
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

  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#172333',
    marginLeft: 3,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172333',
    marginTop: 10,
    paddingHorizontal: 12,
  },

  specialty: {
    fontSize: 11,
    color: '#8190A7',
    marginTop: 2,
    paddingHorizontal: 12,
  },

  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 10,
  },

  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#008178',
  },

  profileBtn: {
    backgroundColor: '#172333',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  profileBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
