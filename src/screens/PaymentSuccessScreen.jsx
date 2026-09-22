import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const PaymentSuccessScreen = ({navigation}) => {
  const handleGoHome = () => {
    navigation?.reset({
      index: 0,
      routes: [{name: 'Main'}],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Icon name="checkmark" size={44} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>
            Your payment has been processed successfully. Thank you for using
            Nirapod.
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.goHomeButton}
            onPress={handleGoHome}>
            {/* <Icon name="home-outline" size={20} color="#FFFFFF" /> */}
            <Text style={styles.goHomeText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PaymentSuccessScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111820',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#8190A7',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bottomSection: {
    paddingBottom: 16,
  },
  goHomeButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#008178',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  goHomeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
