import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomLoader from '../components/common/CustomLoader';
import AuthLayout, {
  AuthField,
  AuthPrimaryButton,
  AuthFooterLink,
} from '../components/auth/AuthLayout';
import {registerUser} from '../services/api';
import {getApiErrorMessage} from '../api/client';
import {useAppModal} from '../contexts/ModalContext';
import {
  EMAIL_NOT_SENT_MESSAGE,
  getDevOtpHint,
  isEmailSent,
} from '../utils/otpHelpers';

const CreateAccountScreen = ({navigation}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const {showError} = useAppModal();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const updateField = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const handleRegister = async () => {
    const {name, email, password} = form;

    if (!name.trim()) {
      showError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      showError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      showError('Please enter a password');
      return;
    }
    if (!agreed) {
      showError('Please accept the Privacy and Policy');
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(name.trim(), email.trim(), password);
      if (!isEmailSent(response)) {
        showError(EMAIL_NOT_SENT_MESSAGE, 'Email not sent');
        return;
      }
      const params = {email: email.trim()};
      const devOtp = getDevOtpHint(response);
      if (devOtp) {
        params.devOtpHint = devOtp;
      }
      navigation?.navigate('VerifyPhone', params);
    } catch (error) {
      showError(
        getApiErrorMessage(error, 'Something went wrong. Please try again.'),
      );
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
        title="Create Account"
        subtitle="Register to start caring for your family">
        <AuthField
          icon="person-outline"
          placeholder="Full name"
          value={form.name}
          onChangeText={text => updateField('name', text)}
          autoCapitalize="words"
        />

        <AuthField
          icon="mail-outline"
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={text => updateField('email', text)}
        />

        <AuthField
          icon="lock-closed-outline"
          placeholder="Password"
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

        <View style={styles.termsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAgreed(prev => !prev)}
            style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I accept all{' '}
            <Text
              style={styles.link}
              onPress={() => navigation?.navigate('PrivacyPolicy')}>
              Privacy and Policy
            </Text>
          </Text>
        </View>

        <AuthPrimaryButton
          title="Create account"
          disabled={loading}
          onPress={handleRegister}
        />


        <AuthFooterLink
          prompt="Already have an account? "
          actionLabel="Login"
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
