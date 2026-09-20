import React, {useState} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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

const LoginScreen = ({navigation}) => {
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
          ? 'Please enter your phone number'
          : 'Please enter your email',
      );
      return;
    }
    if (!password.trim()) {
      showError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(identifier.trim(), password);
      const {token, refreshToken, user} = extractAuthPayload(response);
      if (!token) {
        showError('Login failed');
        return;
      }

      await login(token, refreshToken, user);
      await notificationService.initialize(token);
      await notificationService.registerTokenWithServer(token);
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        'Something went wrong. Please try again.',
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
        showError(message || 'Too many attempts. Please wait and try again.');
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
        title="Welcome Back"
        subtitle="Sign in to continue caring for your loved ones">
        <AuthField
          icon={isPhoneLogin ? 'call-outline' : 'mail-outline'}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder={isPhoneLogin ? 'Phone number' : 'Email address'}
          keyboardType={isPhoneLogin ? 'phone-pad' : 'email-address'}
          autoCapitalize="none"
        />

        <AuthField
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
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
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <AuthPrimaryButton
          title="Login"
          disabled={loading}
          onPress={handleLogin}
        />
        <AuthFooterLink
          prompt="Don't have an account? "
          actionLabel="Register"
          onPress={() => navigation?.navigate('VerifyPhone')}
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
