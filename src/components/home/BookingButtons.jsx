import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BookingButtons = ({navigation}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={() => navigation?.navigate('SelectFamilyMember')}>
        <Icon name="person-add" size={20} color="#008178" />
        <Text style={styles.buttonText}>Book Caregiver</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={() => navigation?.navigate('SelectFamilyMember')}>
        <Icon name="medical" size={20} color="#008178" />
        <Text style={styles.buttonText}>Book Nurse</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BookingButtons;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  button: {
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

  buttonText: {
    color: '#008178',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
