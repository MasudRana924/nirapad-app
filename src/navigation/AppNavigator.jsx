import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

import {useAuth} from '../context/AuthContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import VerifyPhoneScreen from '../screens/VerifyPhoneScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfile from '../screens/EditProfile';
import AddFamilyMember from '../screens/AddFamilyMember';
import FamilyMemberDetails from '../screens/FamilyMemberDetails';
import SelectCaregiverScreen from '../screens/SelectCaregiverScreen';
import SelectFamilyMember from '../screens/SelectFamilyMember';
import HospitalSelection from '../screens/HospitalSelection';
import BookingDateTime from '../screens/BookingDateTime';
import CaregiverDetailsScreen from '../screens/CaregiverDetailsScreen';
import NewBookingScreen from '../screens/NewBookingScreen';
import SelectNurseScreen from '../screens/SelectNurseScreen';
import MedicineScreen from '../screens/MedicineScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import BookingConfirmedScreen from '../screens/BookingConfirmedScreen';
import AllCaregiversScreen from '../screens/AllCaregiversScreen';
import BookingsScreen from '../screens/BookingsScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import SupportChatScreen from '../screens/SupportChatScreen';
import AreaSelectScreen from '../screens/AreaSelectScreen';
import SelectServiceScreen from '../screens/SelectServiceScreen';
import BookingPreviewScreen from '../screens/BookingPreviewScreen';
import PaymentScreen from '../screens/PaymentScreen';
import BkashCheckout from '../screens/BkashCheckout';
import ReviewScreen from '../screens/ReviewScreen';
import PaymentHistory from '../screens/PaymentHistory';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import PaymentCancelledScreen from '../screens/PaymentCancelledScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();

  // insets.bottom = real system navigation bar height reported by the OS
  // after WindowCompat.setDecorFitsSystemWindows(window, false) in MainActivity.kt.
  // Fallback 16 covers older Android devices where inset hasn't loaded yet.
  const safeBottom = insets.bottom > 0 ? insets.bottom : 16;

  const renderTabIcon = (iconName, focused, color) => (
    <View
      style={[
        tabStyles.iconContainer,
        focused && tabStyles.activeIconContainer,
      ]}>
      <Icon
        name={iconName}
        size={24}
        color={focused ? '#008178' : '#7D8BA2'}
      />
    </View>
  );

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 10,
          paddingBottom: safeBottom + 8,
          height: 78 + safeBottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#008178',
        tabBarInactiveTintColor: '#7D8BA2',
        tabBarShowLabel: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabHome'),
          tabBarIcon: ({focused, color}) =>
            renderTabIcon(focused ? 'home' : 'home-outline', focused, color),
        }}
      />
      <Tab.Screen
        name="Family"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Family',
          tabBarIcon: ({focused, color}) =>
            renderTabIcon(focused ? 'people' : 'people-outline', focused, color),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: t('tabBookings'),
          tabBarIcon: ({focused, color}) =>
            renderTabIcon(
              focused ? 'calendar' : 'calendar-outline',
              focused,
              color,
            ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabProfile'),
          tabBarIcon: ({focused, color}) =>
            renderTabIcon(focused ? 'person' : 'person-outline', focused, color),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const {userToken, isLoading} = useAuth();

  // Show loading screen while checking token
  if (isLoading) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color="#008178" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {userToken ? (
        // Authenticated — show main app
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{gestureEnabled: false}}
          />
          <Stack.Screen name="SelectCaregiver" component={SelectCaregiverScreen} />
          <Stack.Screen name="CaregiverDetails" component={CaregiverDetailsScreen} />
          <Stack.Screen name="NewBooking" component={NewBookingScreen} />
          <Stack.Screen name="SelectNurse" component={SelectNurseScreen} />
          <Stack.Screen name="NurseDetails" component={CaregiverDetailsScreen} />
          <Stack.Screen name="Medicine" component={MedicineScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
          <Stack.Screen name="SelectFamilyMember" component={SelectFamilyMember} />
          <Stack.Screen name="SelectService" component={SelectServiceScreen} />
          <Stack.Screen name="AreaSelect" component={AreaSelectScreen} />
          <Stack.Screen name="AddFamilyMember" component={AddFamilyMember} />
          <Stack.Screen name="FamilyMemberDetails" component={FamilyMemberDetails} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="HospitalSelection" component={HospitalSelection} />
          <Stack.Screen name="BookingDateTime" component={BookingDateTime} />
          <Stack.Screen name="BookingPreview" component={BookingPreviewScreen} />
          <Stack.Screen name="AllCaregivers" component={AllCaregiversScreen} />
          <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
          <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
          <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
          <Stack.Screen name="BkashCheckout" component={BkashCheckout} />
          <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
          <Stack.Screen name="PaymentHistory" component={PaymentHistory} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{gestureEnabled: false}} />
          <Stack.Screen name="PaymentCancelled" component={PaymentCancelledScreen} options={{gestureEnabled: false}} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="SupportChat" component={SupportChatScreen} options={{headerShown: false}} />
        </>
      ) : (
        // Not authenticated — show auth screens
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={CreateAccountScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen
            name="VerifyPhone"
            component={VerifyPhoneScreen}
            options={{safeAreaInsets: {top: 0}}}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: '#DDF3F1',
    borderColor: '#CFEAE7',
    borderWidth: 1,
  },
});

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#fff',
  },
});

export default AppNavigator;
