import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {useUserProfile} from '../api/queries';
import Toast from '../components/common/Toast';
import Header from '../components/common/Header';
import {storage} from '../utils/storage';

const ProfileScreen = ({navigation}) => {
  const {logout} = useAuth();
  const {data: profileData, isLoading} = useUserProfile();
  
  const [toast, setToast] = useState({visible: false, message: '', type: 'success'});

  const user = profileData?.data || {};

  const handleUpdateDetails = () => {
    navigation?.navigate('EditProfile');
  };


  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          onPress: async () => {
            await storage.clearBookingData();
            logout();
          },
          style: 'destructive',
        },
      ],
    );
  };

  const showToast = (message, type = 'success') => {
    setToast({visible: true, message, type});
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {id: 1, name: 'Language', icon: 'language-outline', color: '#008178'},
    {id: 2, name: 'Settings', icon: 'settings-outline', color: '#16B890'},
    {id: 3, name: 'Privacy', icon: 'lock-closed-outline', color: '#9B59B6'},
    {id: 4, name: 'Version', icon: 'information-circle-outline', color: '#7D8BA5', value: '1.0.0'},
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Profile" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {user.profile_photo ? (
            <Image source={{uri: user.profile_photo}} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{user.name || 'Loading...'}</Text>
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={styles.editIcon}
                onPress={handleUpdateDetails}>
                <Icon name="pencil-outline" size={18} color="#008178" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileEmail}>{user.email || ''}</Text>
            {user.phone && (
              <Text style={styles.profilePhone}>{user.phone}</Text>
            )}
          </View>
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
              {item.value ? (
                <Text style={styles.menuValue}>{item.value}</Text>
              ) : (
                <Icon name="chevron-forward" size={22} color="#008178" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Icon name="log-out-outline" size={22} color="#E74C3C" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({...toast, visible: false})}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 85,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#182331',
    marginRight: 8,
  },

  editIcon: {
    padding: 4,
  },

  profileEmail: {
    fontSize: 14,
    color: '#7D8BA5',
    marginTop: 3,
  },

  profilePhone: {
    fontSize: 14,
    color: '#7D8BA5',
    marginTop: 2,
  },

  editButton: {
    width: 40,
    height: 40,
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
    borderRadius: 12,
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

  menuValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7D8BA5',
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
