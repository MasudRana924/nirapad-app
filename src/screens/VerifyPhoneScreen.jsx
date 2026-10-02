import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {maskContact, normalizeBdPhone} from '../utils/phone';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

const VerifyPhoneScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const channel = route?.params?.channel === 'phone' ? 'phone' : 'email';
  const rawValue =
    route?.params?.value ||
    route?.params?.email ||
    route?.params?.phone ||
    '';
  const contactValue =
    channel === 'phone' ? normalizeBdPhone(rawValue) : String(rawValue).trim();

  const [otp, setOtp] = useState(['', '', '', '']);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpError, setOtpError] = useState('');
  const inputs = useRef([]);
  const verifyingRef = useRef(false);
  const {login} = useAuth();
  const {showError, showSuccess} = useAppModal();

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = useCallback(
    async code => {
      const enteredOtp = code || otp.join('');
      if (enteredOtp.length !== OTP_LENGTH || verifyingRef.current) {
        return;
      }
      if (!contactValue) {
        showError(t('somethingWentWrong'));
        return;
      }

      verifyingRef.current = true;
      setOtpError('');
      setLoading(true);
      try {
        const response = await verifyOtp({
          otp: enteredOtp,
          ...(channel === 'phone'
            ? {phone: contactValue}
            : {email: contactValue}),
        });
        const {token, refreshToken, user} = extractAuthPayload(response);
        if (!token) {
          showError(t('otpVerificationFailed'));
          return;
        }

        await login(token, refreshToken, user);
        await notificationService.initialize(token);
        await notificationService.registerTokenWithServer(token);
      } catch (error) {
        if (error?.code === API_CODES.OTP_INVALID) {
          setOtp(['', '', '', '']);
          setOtpError(t('invalidOtpInline'));
          inputs.current[0]?.focus();
        } else if (
          error?.code === API_CODES.NOT_FOUND ||
          error?.statusCode === 404
        ) {
          showError(t('userNotFound'));
          navigation?.navigate('Register');
        } else if (
          error?.code === API_CODES.CONFLICT ||
          error?.statusCode === 409
        ) {
          showError(
            getApiErrorMessage(error, t('accountAlreadyVerified')),
          );
          navigation?.navigate('Login');
        } else if (
          error?.code === API_CODES.TOO_MANY_REQUESTS ||
          error?.statusCode === 429
        ) {
          showError(getApiErrorMessage(error, t('tooManyAttempts')));
        } else {
          showError(getApiErrorMessage(error, t('somethingWentWrong')));
        }
        console.error('Verify OTP error:', error);
      } finally {
        verifyingRef.current = false;
        setLoading(false);
      }
    },
    [channel, contactValue, login, navigation, otp, showError, t],
  );

  const applyDigits = digits => {
    const chars = digits.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH).split('');
    const next = ['', '', '', ''];
    chars.forEach((char, index) => {
      next[index] = char;
    });
    setOtp(next);
    setOtpError('');
    if (chars.length === OTP_LENGTH) {
      Keyboard.dismiss();
      handleVerify(chars.join(''));
    } else if (chars.length > 0) {
      inputs.current[chars.length]?.focus();
    }
  };

  const handleOtpChange = (value, index) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }
    if (numericValue.length > 1) {
      applyDigits(numericValue);
      return;
    }

    const next = [...otp];
    next[index] = numericValue;
    setOtp(next);
    setOtpError('');

    if (index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else {
      Keyboard.dismiss();
      handleVerify(next.join(''));
    }
  };

  const handleKeyPress = ({nativeEvent}, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (seconds > 0 || resending || !contactValue) {
      return;
    }
    setResending(true);
    try {
      const response = await resendOtp(
        channel === 'phone' ? {phone: contactValue} : {email: contactValue},
      );
      setSeconds(RESEND_SECONDS);
      setOtp(['', '', '', '']);
      setOtpError('');
      showSuccess(response?.message || t('otpResent'));
    } catch (error) {
      const message = getApiErrorMessage(error, t('somethingWentWrong'));
      const waitMatch = String(message).match(/(\d+)/);
      if (
        error?.code === API_CODES.TOO_MANY_REQUESTS ||
        error?.statusCode === 429
      ) {
        const wait = waitMatch ? Number(waitMatch[1]) : RESEND_SECONDS;
        if (wait > 0) {
          setSeconds(wait);
        }
      }
      showError(message);
      console.error('Resend OTP error:', error);
    } finally {
      setResending(false);
    }
  };

  const isOtpComplete = otp.every(value => value !== '');
  const masked = maskContact(channel, contactValue);

  return (
    <>
      <Loader visible={loading} />
      <AuthLayout
        showBack
        onBack={() => navigation?.goBack()}
        title={t('verifyOtp')}
        subtitle={t('enterOtpSentTo', {target: masked})}>
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
              maxLength={index === 0 ? OTP_LENGTH : 1}
              textAlign="center"
              selectionColor="#008178"
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
              style={[styles.otpInput, value ? styles.otpInputFilled : null]}
            />
          ))}
        </View>

        {otpError ? <Text style={styles.otpError}>{otpError}</Text> : null}
        <Text style={styles.hint}>{t('useCodeHint')}</Text>

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
          loading={loading}
          onPress={() => handleVerify()}
        />
      </AuthLayout>
    </>
  );
};

export default VerifyPhoneScreen;

const styles = StyleSheet.create({
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
    borderColor: '#D4DCDA',
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
  otpError: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 13,
    color: '#C0392B',
  },
  hint: {
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 13,
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
