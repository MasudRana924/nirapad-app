import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import VerifyPhoneScreen from '../screens/VerifyPhoneScreen';
import HomeScreen from '../screens/HomeScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SelectCaregiverScreen from '../screens/SelectCaregiverScreen';
import CaregiverDetailsScreen from '../screens/CaregiverDetailsScreen';
import NewBookingScreen from '../screens/NewBookingScreen';
import SelectNurseScreen from '../screens/SelectNurseScreen';
import MedicineScreen from '../screens/MedicineScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import BookingConfirmedScreen from '../screens/BookingConfirmedScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 4,
          backgroundColor: 'rgba(9, 81, 251, 0.92)',
          position: 'absolute',
          bottom: 10 + insets.bottom,
          left: 20,
          right: 20,
          borderTopWidth: 0,
          borderRadius: 25,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#000',
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
        name="Services"
        component={ServicesScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'medkit' : 'medkit-outline'}
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
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'notifications' : 'notifications-outline'}
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
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={CreateAccountScreen} />
        <Stack.Screen name="VerifyPhone" component={VerifyPhoneScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
