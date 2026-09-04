import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SERVICES = [
  {title: 'Hospital', icon: 'business'},
  {title: 'Book Nurse', icon: 'fitness'},
  {title: 'Elderly Care', icon: 'heart-outline'},
  {title: 'Medicine', icon: 'medkit-outline'},
  {title: 'Reports', icon: 'document-text-outline'},
  {title: 'Doctor', icon: 'person-outline'},
  {title: 'Physio', icon: 'pulse'},
  {title: 'More', icon: 'grid-outline'},
];

const QuickServices = ({navigation}) => {
  const handlePress = title => {
    if (title === 'Elderly Care') {
      navigation?.navigate('SelectCaregiver');
    } else if (title === 'Book Nurse') {
      navigation?.navigate('SelectNurse');
    } else if (title === 'Medicine') {
      navigation?.navigate('Medicine');
    }
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Services</Text>
      </View>

      <View style={styles.grid}>
        {SERVICES.map((service, index) => (
          <TouchableOpacity
            activeOpacity={0.75}
            key={index}
            style={styles.item}
            onPress={() => handlePress(service.title)}>
            <View style={styles.iconCircle}>
              <Icon name={service.icon} size={24} color="#1473DC" />
            </View>
            <Text style={styles.label}>{service.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuickServices;

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 30,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#172333',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  item: {
    width: '24%',
    alignItems: 'center',
    marginBottom: 9,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E9F1FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 9.5,
    color: '#172333',
    marginTop: 5,
    textAlign: 'center',
  },
});
