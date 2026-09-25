import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import Loader from '../components/common/Loader';
import AuthLayout, {AuthPrimaryButton} from '../components/auth/AuthLayout';
import {verifyOtp, resendOtp, extractAuthPayload} from '../services/api';
import {API_CODES, getApiErrorMessage} from '../api/client';
import {useAuth} from '../context/AuthContext';
import {useAppModal} from '../contexts/ModalContext';
import notificationService from '../services/notificationService';
import {
  EMAIL_NOT_SENT_MESSAGE,
  getDevOtpHint,
  isEmailSent,
} from '../utils/otpHelpers';

const OTP_LENGTH = 4;

const VerifyPhoneScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [seconds, setSeconds] = useState(42);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devHint, setDevHint] = useState(
    typeof __DEV__ !== 'undefined' && __DEV__
      ? route?.params?.devOtpHint || null
      : null,
  );
  const inputs = useRef([]);
  const {login} = useAuth();
  const {showError, showSuccess} = useAppModal();
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
      if (!isEmailSent(response)) {
        showError(EMAIL_NOT_SENT_MESSAGE, t('emailNotSent'));
        return;
      }
      setSeconds(42);
      setDevHint(getDevOtpHint(response));
      showSuccess(t('otpResent'));
    } catch (error) {
      showError(
        getApiErrorMessage(error, t('somethingWentWrong')),
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
        showError(t('otpVerificationFailed'));
        return;
      }

      await login(token, refreshToken, user);
      await notificationService.initialize(token);
      await notificationService.registerTokenWithServer(token);
    } catch (error) {
      const fallback =
        error?.code === API_CODES.OTP_INVALID
          ? t('invalidOtp')
          : t('somethingWentWrong');
      showError(getApiErrorMessage(error, fallback));
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
        title={t('verifyOtp')}
        subtitle={t('enterOtpSubtitle')}
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

        {!!devHint && (
          <Text style={styles.devHint}>Dev only — API otp: {devHint}</Text>
        )}

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>{t('didntGetCode')}</Text>
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
                ? t('sending')
                : seconds > 0
                  ? `${t('resendIn')} 0:${String(seconds).padStart(2, '0')}`
                  : t('resend')}
            </Text>
          </TouchableOpacity>
        </View>

        <AuthPrimaryButton
          title={t('verify')}
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
  devHint: {
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 12,
    color: '#7B9390',
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
