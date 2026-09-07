import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BookingButtons = ({navigation}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.button}
        onPress={() => navigation?.navigate('SelectFamilyMember')}>
        <View style={styles.iconWrap}>
          <Icon name="person-add" size={20} color="#008178" />
        </View>
        <Text style={styles.buttonText}>Book Caregiver</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.button}
        onPress={() => navigation?.navigate('SelectNurse')}>
        <View style={styles.iconWrap}>
          <Icon name="medical" size={20} color="#008178" />
        </View>
        <Text style={styles.buttonText}>Book Nurse</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BookingButtons;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },

  button: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F6F6F6',
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  buttonText: {
    flex: 1,
    color: '#111820',
    fontSize: 13,
    fontWeight: '700',
  },
});
