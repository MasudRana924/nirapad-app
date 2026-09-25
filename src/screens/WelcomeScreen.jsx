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
import {requestAppPermissions} from '../utils/permissions';
import PrimaryButton from '../components/common/PrimaryButton';
import {useTranslation} from 'react-i18next';

const WelcomeScreen = ({navigation}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const {t} = useTranslation();

  const steps = [
    {
      heading: t('welcomeHeading1'),
      headingBlue: t('welcomeHeadingBlue1'),
      description: t('welcomeDesc1'),
    },
    {
      heading: t('welcomeHeading2'),
      headingBlue: t('welcomeHeadingBlue2'),
      description: t('welcomeDesc2'),
    },
    {
      heading: t('welcomeHeading3'),
      headingBlue: t('welcomeHeadingBlue3'),
      description: t('welcomeDesc3'),
    },
  ];

  const handleGetStarted = async () => {
    try {
      await requestAppPermissions();
    } catch (error) {
      console.error('Permission error:', error);
    } finally {
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

      {/* Step Indicators and Skip */}
      <View style={styles.stepIndicatorsTop} pointerEvents="box-none">
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
        {currentStep < 2 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.skipButtonTop}
            onPress={handleSkip}>
            <Text style={styles.skipText}>{t('skip')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipPlaceholder} />
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
              <PrimaryButton title={t('getStarted')} onPress={handleGetStarted} />
            ) : (
              <PrimaryButton title={t('next')} onPress={handleNext} />
            )}

            {currentStep === 2 && (
              <PrimaryButton
                title={t('iAlreadyHaveAccount')}
                variant="secondary"
                onPress={() => navigation?.navigate('Login')}
                style={styles.secondarySpacing}
              />
            )}
          </View>

          {/* Terms */}
          {currentStep === 2 && (
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                {t('byContinuingYouAgree')}
                <Text style={styles.linkText}>
                  {t('termsOfService')}
                </Text>
                {t('and')}
              </Text>

              <Text style={styles.privacyText}>
                <Text style={styles.linkText}>
                  {t('privacyPolicy')}
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

  // Step Indicators - left; Skip - right (with clear gap)
  stepIndicatorsTop: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 10,
  },

  stepIndicatorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 16,
  },

  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  stepIndicator: {
    width: 56,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginRight: 8,
  },

  stepIndicatorActive: {
    backgroundColor: '#008178',
    width: 56,
  },

  skipButtonTop: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    minWidth: 48,
    alignItems: 'flex-end',
  },

  skipPlaceholder: {
    minWidth: 48,
  },

  skipButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },

  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  textSection: {
    marginBottom: 22,
  },

  heading: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },

  headingBlue: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },

  description: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 27,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: 0.1,
  },

  buttonSection: {
    width: '100%',
    gap: 14,
  },

  secondarySpacing: {
    marginTop: 0,
  },

  termsContainer: {
    marginTop: 22,
    alignItems: 'center',
  },

  termsText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#000000',
    textAlign: 'center',
  },

  privacyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#000000',
    textAlign: 'center',
  },

  linkText: {
    color: '#000000',
    fontWeight: '500',
  },

});
