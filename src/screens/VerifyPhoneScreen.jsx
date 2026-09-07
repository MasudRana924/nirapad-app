import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Spinner from 'react-native-loading-spinner-overlay';
import {verifyOtp, resendOtp} from '../services/api';
import {useAuth} from '../context/AuthContext';

const OTP_LENGTH = 4;

const VerifyPhoneScreen = ({navigation, route}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [seconds, setSeconds] = useState(42);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputs = useRef([]);
  const {login} = useAuth();

  const email = route?.params?.email || '';

  // Countdown
  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleOtpChange = (value, index) => {
    const numericValue = value.replace(/[^0-9]/g, '');

    const newOtp = [...otp];

    if (!numericValue) {
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    newOtp[index] = numericValue.charAt(numericValue.length - 1);

    setOtp(newOtp);

    if (index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = ({nativeEvent}, index) => {
    if (
      nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (seconds > 0 || resending) {
      return;
    }

    setResending(true);
    try {
      const response = await resendOtp(email);
      if (response.success) {
        setSeconds(42);
        Alert.alert('Success', 'OTP has been resent to your email');
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Resend OTP error:', error);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== OTP_LENGTH) {
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(email, enteredOtp);

      if (response.success && response.token) {
        // Save token and redirect to home
        await login(response.token, response.refreshToken, response.user);
        // Navigation will auto-switch to Main via AuthContext
      } else {
        Alert.alert('Error', response.message || 'OTP verification failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.every(value => value !== '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <Spinner visible={loading} color="#008178" size="large" />
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FC"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation?.goBack()}>
          <Icon
            name="arrow-back"
            size={27}
            color="#182331"
          />
        </TouchableOpacity>
      </View>

      {/* Main */}
      <View style={styles.container}>

        {/* Title */}
        <Text style={styles.title}>
          Verify Email
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          We sent a 4-digit code to
        </Text>

        <Text style={styles.emailText}>
          {email}
        </Text>

        {/* OTP */}
        <View style={styles.otpContainer}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputs.current[index] = ref;
              }}
              value={value}
              onChangeText={text =>
                handleOtpChange(text, index)
              }
              onKeyPress={event =>
                handleKeyPress(event, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor="#1473DC"
              style={[
                styles.otpInput,
                value
                  ? styles.otpInputActive
                  : styles.otpInputEmpty,
              ]}
            />
          ))}
        </View>

        {/* Resend */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code?{' '}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={seconds > 0 || resending}
            onPress={handleResend}>
            <Text
              style={[
                styles.resendLink,
                seconds > 0 && styles.resendLinkDisabled,
              ]}>
              {resending
                ? 'Sending...'
                : seconds > 0
                  ? `Resend in 0:${String(seconds).padStart(2, '0')}`
                  : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!isOtpComplete || loading}
          onPress={handleVerify}
          style={[
            styles.verifyButton,
            !isOtpComplete && styles.verifyButtonDisabled,
          ]}>
          <Text style={styles.verifyButtonText}>
            Verify
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default VerifyPhoneScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    height: 52,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E9EEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    flex: 1,
    paddingHorizontal: 28,
  },

  title: {
    marginTop: 29,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '700',
    color: '#182331',
    letterSpacing: -0.4,
  },

  description: {
    marginTop: 13,
    fontSize: 16,
    lineHeight: 22,
    color: '#7D8BA5',
    fontWeight: '400',
  },

  emailText: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 23,
    color: '#182331',
    fontWeight: '700',
  },

  otpContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 38,
  },

  otpInput: {
    width: 54,
    height: 61,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '600',
    padding: 0,
  },

  otpInputActive: {
    backgroundColor: '#F0F5FC',
    borderWidth: 2,
    borderColor: '#F0F5FC',
    color: '#1473DC',
  },

  otpInputEmpty: {
    backgroundColor: '#F0F2F7',
    borderWidth: 2,
    borderColor: '#F0F2F7',
    color: '#7D8BA5',
  },

  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 27,
  },

  resendText: {
    fontSize: 14.5,
    lineHeight: 20,
    color: '#7D8BA5',
    fontWeight: '400',
  },

  resendLink: {
    fontSize: 14.5,
    lineHeight: 20,
    color: '#1473DC',
    fontWeight: '700',
  },

  resendLinkDisabled: {
    color: '#1473DC',
  },

  verifyButton: {
    width: '100%',
    height: 54,
    borderRadius: 17,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 44,
  },

  verifyButtonDisabled: {
    backgroundColor: '#A8C8EE',
  },

  verifyButtonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  spinnerText: {
    color: '#126AD1',
    fontSize: 16,
    fontWeight: '700',
  },
});
