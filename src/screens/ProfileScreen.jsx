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
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({navigation}) => {
  const menuItems = [
    {id: 1, name: 'Personal Information', icon: 'person-outline', color: '#008178'},
    {id: 2, name: 'My Bookings', icon: 'clipboard-outline', color: '#16B890'},
    {id: 3, name: 'Payment Methods', icon: 'card-outline', color: '#E67E22'},
    {id: 4, name: 'Notifications', icon: 'notifications-outline', color: '#9B59B6'},
    {id: 5, name: 'Help & Support', icon: 'help-circle-outline', color: '#3498DB'},
    {id: 6, name: 'About Us', icon: 'information-circle-outline', color: '#7D8BA5'},
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RH</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Rafiq Hossain</Text>
            <Text style={styles.profilePhone}>+880 1712-345678</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} style={styles.editButton}>
            <Icon name="pencil-outline" size={20} color="#008178" />
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              style={styles.menuItem}>
              <View style={[styles.menuIconBg, {backgroundColor: item.color + '15'}]}>
                <Icon
                  name={item.icon}
                  size={22}
                  color={item.color}
                />
              </View>
              <Text style={styles.menuText}>{item.name}</Text>
              <Icon name="chevron-forward" size={22} color="#C0C8D6" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoutButton}
          onPress={() => navigation?.navigate('Welcome')}>
          <Icon name="log-out-outline" size={22} color="#E74C3C" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },

  scrollContent: {
    paddingBottom: 85,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 6,
  },

  headerTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#182331',
    letterSpacing: -0.4,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },

  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#182331',
  },

  profilePhone: {
    fontSize: 14,
    color: '#7D8BA5',
    marginTop: 3,
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EDF1F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Menu
  menuContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F9',
  },

  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuText: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '500',
    color: '#182331',
    marginLeft: 14,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#FCDEDE',
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginLeft: 10,
  },
});
