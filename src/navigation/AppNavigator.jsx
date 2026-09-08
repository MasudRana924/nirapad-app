import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {useAuth} from '../context/AuthContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import VerifyPhoneScreen from '../screens/VerifyPhoneScreen';
import HomeScreen from '../screens/HomeScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfile from '../screens/EditProfile';
import FamilyScreen from '../screens/FamilyScreen';
import AddFamilyMember from '../screens/AddFamilyMember';
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
import InboxScreen from '../screens/InboxScreen';
import AreaSelectScreen from '../screens/AreaSelectScreen';
import SelectServiceScreen from '../screens/SelectServiceScreen';
import BookingPreviewScreen from '../screens/BookingPreviewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  // Manual bottom inset so tab bar sits above system nav (not under it)
  const bottomInset = insets.bottom > 0 ? insets.bottom : 12;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        // Disable auto inset — we apply it ourselves to avoid underlap/double-gap
        safeAreaInsets: {bottom: 0},
        tabBarStyle: {
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E3E8F0',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarActiveTintColor: '#008178',
        tabBarInactiveTintColor: '#7D8BA2',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Family"
        component={FamilyScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'people' : 'people-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'mail' : 'mail-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'calendar' : 'calendar-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
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
    <NavigationContainer>
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
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="HospitalSelection" component={HospitalSelection} />
            <Stack.Screen name="BookingDateTime" component={BookingDateTime} />
            <Stack.Screen name="BookingPreview" component={BookingPreviewScreen} />
            <Stack.Screen name="AllCaregivers" component={AllCaregiversScreen} />
            <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
          </>
        ) : (
          // Not authenticated — show auth screens
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={CreateAccountScreen} />
            <Stack.Screen name="VerifyPhone" component={VerifyPhoneScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#fff',
  },
});

export default AppNavigator;
