import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomLoader from '../components/common/CustomLoader';
import AuthLayout, {
  AuthChannelToggle,
  AuthField,
  AuthPhoneField,
  AuthPrimaryButton,
  AuthFooterLink,
} from '../components/auth/AuthLayout';
import {registerUser} from '../services/api';
import {getApiErrorMessage} from '../api/client';
import {useAppModal} from '../contexts/ModalContext';
import {isValidBdPhone, normalizeBdPhone} from '../utils/phone';
import {useTranslation} from 'react-i18next';

const CreateAccountScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [channel, setChannel] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const {showError, showConfirm} = useAppModal();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const handleRegister = async () => {
    const {name, email, phone, password, confirmPassword} = form;
    const isPhone = channel === 'phone';

    if (!name.trim()) {
      showError(t('pleaseEnterName'));
      return;
    }
    if (isPhone) {
      if (!phone.trim()) {
        setPhoneError(t('invalidPhone'));
        return;
      }
      if (!isValidBdPhone(phone)) {
        setPhoneError(t('invalidPhone'));
        return;
      }
    } else if (!email.trim()) {
      showError(t('pleaseEnterEmail'));
      return;
    }
    if (!password.trim()) {
      showError(t('pleaseEnterAPassword'));
      return;
    }
    if (password.length < 6) {
      showError(t('passwordMinLength'));
      return;
    }
    if (password !== confirmPassword) {
      showError(t('passwordsDoNotMatch'));
      return;
    }
    if (!agreed) {
      showError(t('pleaseAcceptPrivacy'));
      return;
    }

    const normalizedPhone = isPhone ? normalizeBdPhone(phone) : '';
    setPhoneError('');
    setLoading(true);
    try {
      const response = await registerUser({
        name: name.trim(),
        password,
        ...(isPhone ? {phone: normalizedPhone} : {email: email.trim()}),
      });
      const otpChannel =
        response?.data?.otp_channel === 'phone' ? 'phone' : 'email';
      navigation?.navigate('VerifyPhone', {
        channel: otpChannel,
        value: otpChannel === 'phone' ? normalizedPhone : email.trim(),
      });
    } catch (error) {
      if (error?.statusCode === 409) {
        showConfirm({
          title: t('error'),
          message: getApiErrorMessage(error, t('somethingWentWrong')),
          confirmText: t('loginInstead'),
          cancelText: t('close'),
          onConfirm: () => navigation?.navigate('Login'),
        });
      } else {
        showError(getApiErrorMessage(error, t('somethingWentWrong')));
      }
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomLoader overlay visible={loading} />
      <AuthLayout
        showBack
        onBack={() => navigation?.goBack()}
        title={t('createAccount')}
        subtitle={
          channel === 'phone' ? t('registerWithPhone') : t('registerWithEmail')
        }>
        <AuthChannelToggle value={channel} onChange={setChannel} />

        <AuthField
          icon="person-outline"
          placeholder={t('fullName')}
          value={form.name}
          onChangeText={text => updateField('name', text)}
          autoCapitalize="words"
        />

        {channel === 'phone' ? (
          <AuthPhoneField
            value={form.phone}
            error={phoneError}
            onChangeText={text => {
              setPhoneError('');
              updateField('phone', text);
            }}
          />
        ) : (
          <AuthField
            icon="mail-outline"
            placeholder={t('emailAddress')}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={text => updateField('email', text)}
          />
        )}

        <AuthField
          icon="lock-closed-outline"
          placeholder={t('password')}
          secureTextEntry={!showPassword}
          value={form.password}
          onChangeText={text => updateField('password', text)}
          right={
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPassword(prev => !prev)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#7E9390"
              />
            </TouchableOpacity>
          }
        />

        <AuthField
          icon="lock-closed-outline"
          placeholder={t('confirmPassword')}
          secureTextEntry={!showPassword}
          value={form.confirmPassword}
          onChangeText={text => updateField('confirmPassword', text)}
        />

        <View style={styles.termsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAgreed(prev => !prev)}
            style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            {t('iAcceptAll')}
            <Text
              style={styles.link}
              onPress={() => navigation?.navigate('PrivacyPolicy')}>
              {t('privacyAndPolicy')}
            </Text>
          </Text>
        </View>

        <AuthPrimaryButton
          title={t('createAccountBtn')}
          disabled={loading}
          onPress={handleRegister}
        />

        <AuthFooterLink
          prompt={t('alreadyHaveAccount')}
          actionLabel={t('login')}
          onPress={() => navigation?.navigate('Login')}
        />
      </AuthLayout>
    </>
  );
};

export default CreateAccountScreen;

const styles = StyleSheet.create({
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
    marginBottom: 18,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#E4EEEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: '#008178',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#7E9390',
  },
  link: {
    color: '#008178',
    fontWeight: '700',
  },
});
