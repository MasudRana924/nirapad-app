import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import Loader from '../components/common/Loader';
import AuthLayout, {AuthPrimaryButton} from '../components/auth/AuthLayout';
import {verifyOtp, resendOtp, extractAuthPayload} from '../services/api';
import {useAuth} from '../context/AuthContext';
import notificationService from '../services/notificationService';

const OTP_LENGTH = 4;

const VerifyPhoneScreen = ({navigation, route}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [seconds, setSeconds] = useState(42);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);
  const {login} = useAuth();
  const email = route?.params?.email || '';

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
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
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
      console.log('🔍 Verifying OTP...');
      const response = await verifyOtp(email, enteredOtp);

      const {token, refreshToken, user} = extractAuthPayload(response);
      if (response.success && token) {
        console.log('✅ OTP verification response received');

        // Step 1: Store authentication tokens (data.token, data.refreshToken, data.user)
        await login(token, refreshToken, user);
        console.log('✅ Auth tokens stored locally');

        // Step 2: Initialize notification service
        console.log('🔔 Initializing notification service...');
        const notificationInitialized = await notificationService.initialize(
          token,
        );

        if (notificationInitialized) {
          console.log('✅ Notification service initialized');
        } else {
          console.log('⚠️ Notification service initialization failed');
        }

        // Step 3: Register FCM token with server
        console.log('📱 Registering FCM token with server...');
        const tokenRegistered =
          await notificationService.registerTokenWithServer(token);

        if (tokenRegistered) {
          console.log('✅ FCM token registered successfully');
        } else {
          console.log('⚠️ FCM token registration failed');
        }
      } else {
        Alert.alert('Error', response.message || 'OTP verification failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('❌ Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.every(value => value !== '');

  return (
    <>
      <Loader visible={loading} />
      <AuthLayout
        showBack
        onBack={() => navigation?.goBack()}
        compactHero
        title="Verify email"
        subtitle="We sent a 4-digit code to your email"
        extra={email ? <Text style={styles.emailText}>{email}</Text> : null}>
        <View style={styles.otpContainer}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputs.current[index] = ref;
              }}
              value={value}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={event => handleKeyPress(event, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor="#008178"
              style={[styles.otpInput, value ? styles.otpInputFilled : null]}
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't get the code? </Text>
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

        <AuthPrimaryButton
          title="Verify"
          disabled={!isOtpComplete || loading}
          onPress={handleVerify}
        />
      </AuthLayout>
    </>
  );
};

export default VerifyPhoneScreen;

const styles = StyleSheet.create({
  emailText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#1B3330',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    marginBottom: 8,
  },
  otpInput: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#F4F8F6',
    borderWidth: 1.5,
    borderColor: '#E4EEEA',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#163532',
    padding: 0,
  },
  otpInputFilled: {
    borderColor: '#008178',
    backgroundColor: '#E6F4F3',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: 14,
    color: '#7B9390',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#008178',
  },
  resendLinkDisabled: {
    color: '#7B9390',
  },
});
