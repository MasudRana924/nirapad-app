import React, {useState} from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import LinearGradient from 'react-native-linear-gradient';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

const WelcomeScreen = ({navigation}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      heading: 'Professional Care,',
      headingBlue: 'Anytime You Need',
      description: 'Verified caregivers, nurses, and hospital attendants — available when your family needs it most.',
    },
    {
      heading: 'Book Nurses',
      headingBlue: 'For Family Members',
      description: 'Easily book professional nurses and caregivers for your loved ones with just a few taps.',
    },
    {
      heading: 'Order Medicines',
      headingBlue: 'At Your Doorstep',
      description: 'Get your prescribed medicines delivered to your home quickly and safely.',
    },
  ];

  const handleGetStarted = async () => {
    try {
      // Request location permission
      await request(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      );

      // Request notification permission
      await request(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
          : PERMISSIONS.IOS.NOTIFICATIONS,
      );

      // Navigate to Login screen
      navigation?.navigate('Login');
    } catch (error) {
      console.error('Permission error:', error);
      // Navigate to Login screen even if permissions are denied
      navigation?.navigate('Login');
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(2);
  };

  const currentStepData = steps[currentStep];
  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      {/* Step Indicators and Skip - Absolute Top */}
      <View style={styles.stepIndicatorsTop}>
        <View style={styles.stepIndicatorsRow}>
          {[0, 1, 2].map(step => (
            <View
              key={step}
              style={[
                styles.stepIndicator,
                step === currentStep && styles.stepIndicatorActive,
              ]}
            />
          ))}
        </View>
        {currentStep < 2 && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.skipButtonTop}
            onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Background Image */}
      <Image
        source={require('../assets/welcome-family.jpg')}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* Image Fade */}
      <LinearGradient
        colors={[
          'rgba(248,249,252,0)',
          'rgba(248,249,252,0.25)',
          'rgba(248,249,252,0.75)',
          '#F8F9FC',
        ]}
        locations={[0, 0.35, 0.7, 1]}
        style={styles.imageFade}
      />

      {/* Content */}
      <SafeAreaView style={styles.content}>
        <View style={styles.contentInner}>

          {/* Heading */}
          <View style={styles.textSection}>

            <Text style={styles.heading}>
              {currentStepData.heading}
            </Text>

            <Text style={styles.headingBlue}>
              {currentStepData.headingBlue}
            </Text>

            <Text style={styles.description}>
              {currentStepData.description}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonSection}>
            {currentStep === 2 ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.primaryButton}
                onPress={handleGetStarted}>
                <Text style={styles.primaryButtonText}>
                  Get Started
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.primaryButton}
                onPress={handleNext}>
                <Text style={styles.primaryButtonText}>
                  Next
                </Text>
              </TouchableOpacity>
            )}

            {currentStep === 2 && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.secondaryButton}
                onPress={() => navigation?.navigate('Login')}>
                <Text style={styles.secondaryButtonText}>
                  I already have an account
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Terms */}
          {currentStep === 2 && (
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.linkText}>
                  Terms of Service
                </Text>
                {' '}and
              </Text>

              <Text style={styles.privacyText}>
                <Text style={styles.linkText}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          )}

        </View>
      </SafeAreaView>

    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    width: '100%',
    height: '100%',
  },

  imageFade: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    height: '65%',
  },

  content: {
    flex: 1,

    justifyContent: 'flex-end',

    width: '100%',
  },

  contentInner: {
    width: '90%',
    alignSelf: 'center',

    paddingBottom: 26,
  },

  // Step Indicators - Absolute Top
  stepIndicatorsTop: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },

  stepIndicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  stepIndicator: {
    width: 70,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },

  stepIndicatorActive: {
    backgroundColor: '#008178',
    width: 70,
  },

  // Skip Button Top
  skipButtonTop: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Skip Button
  skipButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },

  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008178',
  },

  textSection: {
    marginBottom: 22,
  },

  heading: {
    fontSize: 30,
    lineHeight: 36,

    fontWeight: '700',

    color: '#111827',

    letterSpacing: -0.5,
  },

  headingBlue: {
    fontSize: 30,
    lineHeight: 36,

    fontWeight: '700',

    color: '#008178',

    letterSpacing: -0.5,
  },

  description: {
    marginTop: 12,

    fontSize: 17,
    lineHeight: 27,

    fontWeight: '400',

    color: '#7A89A3',

    letterSpacing: 0.1,
  },

  buttonSection: {
    width: '100%',
    gap: 14,
  },

  primaryButton: {
    height: 52,

    width: '100%',

    borderRadius: 17,

    backgroundColor: '#008178',

    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    fontSize: 17,

    fontWeight: '600',

    color: '#FFFFFF',
  },

  secondaryButton: {
    height: 52,

    width: '100%',

    borderRadius: 17,

    backgroundColor: 'rgba(255,255,255,0.92)',

    borderWidth: 1.5,

    borderColor: '#008178',

    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    fontSize: 17,

    fontWeight: '600',

    color: '#008178',
  },

  termsContainer: {
    marginTop: 22,

    alignItems: 'center',
  },

  termsText: {
    fontSize: 14,

    lineHeight: 21,

    color: '#8995A9',

    textAlign: 'center',
  },

  privacyText: {
    fontSize: 14,

    lineHeight: 21,

    color: '#8995A9',

    textAlign: 'center',
  },

  linkText: {
    color: '#008178',

    fontWeight: '500',
  },

});
