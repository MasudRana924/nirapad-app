import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

import {useAuth} from '../context/AuthContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import VerifyPhoneScreen from '../screens/VerifyPhoneScreen';
import HomeScreen from '../screens/HomeScreen';
import FamilyScreen from '../screens/FamilyScreen';
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
import InboxScreen from '../screens/InboxScreen';
import ServicesScreen from '../screens/ServicesScreen';
import {useSupportUnreadCount} from '../api/queries';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HIDDEN_TAB_BAR_ROUTES = ['Messages'];

function FloatingTabBar({state, descriptors, navigation}) {
  const insets = useSafeAreaInsets();
  // insets.bottom = real system navigation bar height reported by the OS
  // after WindowCompat.setDecorFitsSystemWindows(window, false) in MainActivity.kt.
  // Fallback 16 covers older Android devices where inset hasn't loaded yet.
  const safeBottom = insets.bottom > 0 ? insets.bottom : 16;
  const activeRoute = state.routes[state.index];

  if (HIDDEN_TAB_BAR_ROUTES.includes(activeRoute.name)) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[tabStyles.barWrap, {bottom: safeBottom + 6}]}>
      <View style={tabStyles.bar}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const focused = state.index === index;
          const label =
            typeof options.tabBarLabel === 'string' ? options.tabBarLabel : null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              style={tabStyles.item}
              onPress={onPress}>
              {options.tabBarIcon?.({focused})}
              {label ? (
                <Text
                  numberOfLines={1}
                  style={[tabStyles.label, focused && tabStyles.labelActive]}>
                  {label}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const renderTabBar = props => <FloatingTabBar {...props} />;

function MainTabs() {
  const {t} = useTranslation();
  const {count: supportUnread} = useSupportUnreadCount();

  const renderTabIcon = (iconName, focused) => (
    <Icon
      name={iconName}
      size={21}
      color={focused ? '#FFFFFF' : '#8A9290'}
    />
  );

  return (
    <Tab.Navigator
      initialRouteName="Home"
      backBehavior="history"
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabHome'),
          tabBarIcon: ({focused}) =>
            renderTabIcon(focused ? 'home' : 'home-outline', focused),
        }}
      />
      <Tab.Screen
        name="Family"
        component={FamilyScreen}
        options={{
          tabBarLabel: t('tabFamily'),
          tabBarIcon: ({focused}) =>
            renderTabIcon(focused ? 'people' : 'people-outline', focused),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={SupportChatScreen}
        options={{
          tabBarIcon: () => renderChatIcon(Number(supportUnread) > 0),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: t('tabBookings'),
          tabBarIcon: ({focused}) =>
            renderTabIcon(
              focused ? 'calendar' : 'calendar-outline',
              focused,
            ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabProfile'),
          tabBarIcon: ({focused}) =>
            renderTabIcon(focused ? 'person' : 'person-outline', focused),
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
          <Stack.Screen name="FamilyScreen" component={FamilyScreen} />
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
          <Stack.Screen name="Inbox" component={InboxScreen} />
          <Stack.Screen name="Services" component={ServicesScreen} />
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

const renderChatIcon = hasUnread => (
  <View style={tabStyles.chatButton}>
    <Icon name="chatbubble-ellipses" size={22} color="#FFFFFF" />
    {hasUnread ? <View style={tabStyles.badgeDot} /> : null}
  </View>
);

const tabStyles = StyleSheet.create({
  barWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    height: 64,
    borderRadius: 32,
    backgroundColor: '#008178',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    color: '#8A9290',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  chatButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4B4B',
    top: 2,
    right: 2,
    borderWidth: 1.5,
    borderColor: '#000000',
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
