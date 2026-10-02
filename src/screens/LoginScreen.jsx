import React, {useState} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import CustomLoader from '../components/common/CustomLoader';
import AuthLayout, {
  AuthChannelToggle,
  AuthField,
  AuthPhoneField,
  AuthPrimaryButton,
  AuthFooterLink,
} from '../components/auth/AuthLayout';
import {loginUser, resendOtp, extractAuthPayload} from '../services/api';
import {API_CODES, getApiErrorMessage} from '../api/client';
import {useAuth} from '../context/AuthContext';
import {useAppModal} from '../contexts/ModalContext';
import notificationService from '../services/notificationService';
import LanguageSwitch from '../components/common/LanguageSwitch';
import {isValidBdPhone, normalizeBdPhone} from '../utils/phone';

const LoginScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [channel, setChannel] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const {login} = useAuth();
  const {showError} = useAppModal();

  const switchChannel = next => {
    setChannel(next);
    setIdentifier('');
    setPhoneError('');
  };

  const handleLogin = async () => {
    const isPhone = channel === 'phone';
    const trimmed = identifier.trim();

    if (!trimmed) {
      if (isPhone) {
        setPhoneError(t('invalidPhone'));
      } else {
        showError(t('pleaseEnterEmail'));
      }
      return;
    }
    if (isPhone && !isValidBdPhone(trimmed)) {
      setPhoneError(t('invalidPhone'));
      return;
    }
    if (!password.trim()) {
      showError(t('pleaseEnterPassword'));
      return;
    }

    const phone = isPhone ? normalizeBdPhone(trimmed) : '';
    const email = isPhone ? '' : trimmed;
    setPhoneError('');
    setLoading(true);
    try {
      const response = await loginUser(
        isPhone ? {phone, password} : {email, password},
      );
      const {token, refreshToken, user} = extractAuthPayload(response);
      if (!token) {
        showError(t('loginFailed'));
        return;
      }

      await login(token, refreshToken, user);
      await notificationService.initialize(token);
      await notificationService.registerTokenWithServer(token);
    } catch (err) {
      if (
        err?.statusCode === 403 &&
        err?.code === API_CODES.ACCOUNT_NOT_VERIFIED
      ) {
        try {
          await resendOtp(isPhone ? {phone} : {email});
        } catch (resendError) {
          const cooldown =
            resendError?.code === API_CODES.TOO_MANY_REQUESTS ||
            resendError?.statusCode === 429;
          if (!cooldown) {
            showError(
              getApiErrorMessage(resendError, t('somethingWentWrong')),
            );
          }
        }
        navigation?.navigate('VerifyPhone', {
          channel,
          value: isPhone ? phone : email,
        });
        return;
      }
      if (err?.statusCode === 401 || err?.code === API_CODES.UNAUTHORIZED) {
        showError(t('invalidCredentials'));
      } else {
        showError(getApiErrorMessage(err, t('somethingWentWrong')));
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomLoader overlay visible={loading} />
      <AuthLayout
        title={t('welcomeBack')}
        subtitle={
          channel === 'phone' ? t('signInWithPhone') : t('signInWithEmail')
        }
        langSwitch={<LanguageSwitch />}>
        <AuthChannelToggle value={channel} onChange={switchChannel} />

        {channel === 'phone' ? (
          <AuthPhoneField
            value={identifier}
            error={phoneError}
            onChangeText={text => {
              setPhoneError('');
              setIdentifier(text);
            }}
          />
        ) : (
          <AuthField
            icon="mail-outline"
            value={identifier}
            onChangeText={setIdentifier}
            placeholder={t('emailAddress')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}

        <AuthField
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder={t('password')}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          right={
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#7E9390"
              />
            </TouchableOpacity>
          }
        />

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.forgotButton}
          onPress={() => navigation?.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
        </TouchableOpacity>

        <AuthPrimaryButton
          title={t('login')}
          disabled={loading}
          onPress={handleLogin}
        />
        <AuthFooterLink
          prompt={t('dontHaveAccount')}
          actionLabel={t('register')}
          onPress={() => navigation?.navigate('Register')}
        />
      </AuthLayout>
    </>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#008178',
  },
});
