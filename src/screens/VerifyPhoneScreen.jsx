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
import {API_CODES, getApiErrorMessage} from '../api/client';
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
      await resendOtp(email);
      setSeconds(42);
      Alert.alert('Success', 'OTP has been resent to your email');
    } catch (error) {
      Alert.alert(
        'Error',
        getApiErrorMessage(error, 'Something went wrong. Please try again.'),
      );
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
      const {token, refreshToken, user} = extractAuthPayload(response);
      if (!token) {
        Alert.alert('Error', 'OTP verification failed');
        return;
      }

      await login(token, refreshToken, user);
      await notificationService.initialize(token);
      await notificationService.registerTokenWithServer(token);
    } catch (error) {
      const fallback =
        error?.code === API_CODES.OTP_INVALID
          ? 'Invalid OTP. Please try again.'
          : 'Something went wrong. Please try again.';
      Alert.alert('Error', getApiErrorMessage(error, fallback));
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
        title="Verify OTP"
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9DDD7',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#163532',
    padding: 0,
  },
  otpInputFilled: {
    borderColor: '#008178',
    backgroundColor: '#FFFFFF',
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
