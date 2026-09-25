import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import CustomLoader from '../components/common/CustomLoader';
import AuthLayout, {
  AuthField,
  AuthPrimaryButton,
  AuthFooterLink,
} from '../components/auth/AuthLayout';
import {loginUser, extractAuthPayload} from '../services/api';
import {API_CODES, getApiErrorMessage} from '../api/client';
import {useAuth} from '../context/AuthContext';
import {useAppModal} from '../contexts/ModalContext';
import notificationService from '../services/notificationService';
import LanguageSwitch from '../components/common/LanguageSwitch';

const LoginScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const {login} = useAuth();
  const {showError} = useAppModal();

  const handleLogin = async () => {
    if (!identifier.trim()) {
      showError(
        isPhoneLogin
          ? t('pleaseEnterPhone')
          : t('pleaseEnterEmail'),
      );
      return;
    }
    if (!password.trim()) {
      showError(t('pleaseEnterPassword'));
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(identifier.trim(), password);
      const {token, refreshToken, user} = extractAuthPayload(response);
      if (!token) {
        showError(t('loginFailed'));
        return;
      }

      await login(token, refreshToken, user);
      await notificationService.initialize(token);
      await notificationService.registerTokenWithServer(token);
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        t('somethingWentWrong'),
      );
      const needsVerify =
        err?.errors?.some?.(e =>
          String(e?.message || e)
            .toLowerCase()
            .includes('verify'),
        ) || message.toLowerCase().includes('verify');
      if (needsVerify && !isPhoneLogin) {
        navigation?.navigate('VerifyPhone', {email: identifier.trim()});
      }
      if (err?.code === API_CODES.OTP_INVALID) {
        showError(message);
      } else if (err?.code === API_CODES.TOO_MANY_REQUESTS) {
        showError(message || t('tooManyAttempts'));
      } else {
        showError(message);
      }
      console.error('❌ Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomLoader overlay visible={loading} />
      <AuthLayout
        title={t('welcomeBack')}
        subtitle={t('signInSubtitle')}
        extra={
          <View style={styles.langSwitchWrap}>
            <LanguageSwitch />
          </View>
        }>
        <AuthField
          icon={isPhoneLogin ? 'call-outline' : 'mail-outline'}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder={isPhoneLogin ? t('phoneNumber') : t('emailAddress')}
          keyboardType={isPhoneLogin ? 'phone-pad' : 'email-address'}
          autoCapitalize="none"
        />

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
  langSwitchWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
