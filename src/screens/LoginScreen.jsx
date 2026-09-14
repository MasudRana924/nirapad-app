import React, {useState} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Loader from '../components/common/Loader';
import AuthLayout, {
  AuthField,
  AuthPrimaryButton,
  AuthOutlineButton,
  AuthOrDivider,
  AuthFooterLink,
} from '../components/auth/AuthLayout';
import {loginUser, extractAuthPayload} from '../services/api';
import {useAuth} from '../context/AuthContext';
import notificationService from '../services/notificationService';

const LoginScreen = ({navigation}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {login} = useAuth();

  const handleLogin = async () => {
    setError('');
    if (!identifier.trim()) {
      setError(
        isPhoneLogin
          ? 'Please enter your phone number'
          : 'Please enter your email',
      );
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Starting login process...');
      const response = await loginUser(identifier.trim(), password);

      const {token, refreshToken, user} = extractAuthPayload(response);
      if (response.success && token) {
        console.log('✅ Login API response received');

        await login(token, refreshToken, user);
        console.log('✅ Auth tokens stored locally');

        console.log('🔔 Initializing notification service...');
        const notificationInitialized = await notificationService.initialize(
          token,
        );

        if (notificationInitialized) {
          console.log('✅ Notification service initialized');
        } else {
          console.log(
            '⚠️ Notification service initialization failed, but continuing...',
          );
        }

        console.log('📱 Registering FCM token with server...');
        const tokenRegistered =
          await notificationService.registerTokenWithServer(token);

        if (tokenRegistered) {
          console.log('✅ FCM token registered successfully');
        } else {
          console.log(
            '⚠️ FCM token registration failed, but login successful',
          );
        }
      } else {
        const message = response.message || 'Login failed';
        const needsVerify =
          response.errors?.some?.(e =>
            String(e?.message || e)
              .toLowerCase()
              .includes('verify'),
          ) || message.toLowerCase().includes('verify');
        if (needsVerify && !isPhoneLogin) {
          navigation?.navigate('VerifyPhone', {email: identifier.trim()});
        }
        setError(message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('❌ Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Loader visible={loading} />
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to continue caring for your loved ones">
        <AuthField
          icon={isPhoneLogin ? 'call-outline' : 'mail-outline'}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder={
            isPhoneLogin
              ? 'Enter your phone number'
              : 'Enter your email address'
          }
          keyboardType={isPhoneLogin ? 'phone-pad' : 'email-address'}
          autoCapitalize="none"
        />

        <AuthField
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
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

        {/* <AuthOrDivider /> */}

        {/* <AuthOutlineButton
          icon="call-outline"
          title={isPhoneLogin ? 'Login with Email' : 'Login with Phone Number'}
          onPress={() => {
            setIsPhoneLogin(prev => !prev);
            setIdentifier('');
            setError('');
          }}
        /> */}

        <AuthFooterLink
          prompt="Don't have an account? "
          actionLabel="Register"
          onPress={() => navigation?.navigate('Register')}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 12,
  },
});
