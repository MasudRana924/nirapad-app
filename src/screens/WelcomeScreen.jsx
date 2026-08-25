import React from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import LinearGradient from 'react-native-linear-gradient';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

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
              Professional Care,
            </Text>

            <Text style={styles.headingBlue}>
              Anytime You Need
            </Text>

            <Text style={styles.description}>
              Verified caregivers, nurses, and hospital
              attendants — available when your family
              needs it most.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonSection}>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.primaryButton}
              onPress={() => navigation?.navigate('Login')}
            >
              <Text style={styles.primaryButtonText}>
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.secondaryButton}
              onPress={() => navigation?.navigate('Login')}
            >
              <Text style={styles.secondaryButtonText}>
                I already have an account
              </Text>
            </TouchableOpacity>

          </View>

          {/* Terms */}
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

    color: '#2474D4',

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

    backgroundColor: '#2474D4',

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

    borderColor: '#2474D4',

    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    fontSize: 17,

    fontWeight: '600',

    color: '#2474D4',
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
    color: '#2474D4',

    fontWeight: '500',
  },

});
