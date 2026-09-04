import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeHeader = ({navigation}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity activeOpacity={0.8} style={styles.profileButton}>
          <Image
            source={{
              uri: 'https://randomuser.me/api/portraits/women/44.jpg',
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <View style={styles.greetingBlock}>
          <Text style={styles.goodMorning}>Good morning 👋</Text>
          <Text style={styles.userName}>Nadia Rahman</Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.notificationButton}>
        <Icon name="notifications-outline" size={21} color="#172333" />
        <View style={styles.notificationDot} />
      </TouchableOpacity>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E3E8F0',
  },

  profileImage: {
    width: '100%',
    height: '100%',
  },

  greetingBlock: {
    justifyContent: 'center',
  },

  goodMorning: {
    fontSize: 12,
    lineHeight: 17,
    color: '#8190A7',
    fontWeight: '400',
  },

  userName: {
    fontSize: 18,
    lineHeight: 23,
    color: '#172333',
    fontWeight: '700',
    marginTop: 1,
  },

  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E34242',
    borderWidth: 1.5,
    borderColor: '#F6F8FA',
    right: 8,
    top: 8,
  },
});
