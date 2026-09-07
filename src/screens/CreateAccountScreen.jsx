import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Spinner from 'react-native-loading-spinner-overlay';
import {registerUser} from '../services/api';

const CreateAccountScreen = ({navigation}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const updateField = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    const {name, email, password} = form;

    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    if (!agreed) {
      Alert.alert('Error', 'Please agree to the Terms of Service');
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(name.trim(), email.trim(), password);

      if (response.success) {
        navigation?.navigate('VerifyPhone', {email: email.trim()});
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Spinner visible={loading} color="#008178" size="large" />
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FC"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={() => navigation?.goBack()}>
              <Icon
                name="arrow-back"
                size={27}
                color="#182331"
              />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.container}>

            {/* Title */}
            <Text style={styles.title}>Create Account</Text>

            <Text style={styles.subtitle}>
              Register to start caring for your family
            </Text>

            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8290A8"
                  value={form.name}
                  onChangeText={text =>
                    updateField('name', text)
                  }
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>

              <View style={styles.inputContainer}>
                <Icon
                  name="mail-outline"
                  size={22}
                  color="#7D8BA2"
                  style={styles.leftIcon}
                />

                <TextInput
                  style={[styles.input, styles.iconInput]}
                  placeholder="rafiq@email.com"
                  placeholderTextColor="#8290A8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={text =>
                    updateField('email', text)
                  }
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>

              <View style={styles.inputContainer}>
                <Icon
                  name="lock-closed-outline"
                  size={22}
                  color="#7D8BA2"
                  style={styles.leftIcon}
                />

                <TextInput
                  style={[
                    styles.input,
                    styles.iconInput,
                    styles.passwordInput,
                  ]}
                  placeholder="Create a strong password"
                  placeholderTextColor="#8290A8"
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={text =>
                    updateField('password', text)
                  }
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.rightIconButton}
                  onPress={() =>
                    setShowPassword(prev => !prev)
                  }>
                  <Icon
                    name={
                      showPassword
                        ? 'eye-outline'
                        : 'eye-off-outline'
                    }
                    size={22}
                    color="#7D8BA2"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAgreed(prev => !prev)}
                style={[
                  styles.checkbox,
                  agreed && styles.checkboxActive,
                ]}>
                {agreed && (
                  <Icon
                    name="checkmark"
                    size={17}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>

              <Text style={styles.termsText}>
                I agree to Nirapod's{' '}
                <Text style={styles.link}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Create Account */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.createButton}
              disabled={loading}
              onPress={handleRegister}>
              <Text style={styles.createButtonText}>
                Create Account
              </Text>
            </TouchableOpacity>

            {/* Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation?.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateAccountScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    height: 52,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    paddingHorizontal: 28,
    paddingTop: 13,
  },

  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    color: '#182331',
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '400',
    color: '#7D8BA5',
  },

  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#182331',
    marginBottom: 7,
  },

  field: {
    marginTop: 20,
  },

  inputContainer: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F0F2F7',
    borderWidth: 1,
    borderColor: '#F0F2F7',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 13,
    paddingVertical: 0,
    fontSize: 16,
    fontWeight: '400',
    color: '#273447',
  },

  iconInput: {
    paddingLeft: 0,
  },

  passwordInput: {
    paddingRight: 42,
  },

  leftIcon: {
    marginLeft: 13,
    marginRight: 10,
  },

  rightIconButton: {
    position: 'absolute',
    right: 12,
    width: 30,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 21,
    paddingRight: 4,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#E0E5ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    marginTop: 1,
  },

  checkboxActive: {
    backgroundColor: '#008178',
  },

  termsText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#7D8BA5',
    fontWeight: '400',
  },

  link: {
    color: '#126AD1',
    fontWeight: '400',
  },

  spinnerText: {
    color: '#126AD1',
    fontSize: 16,
    fontWeight: '700',
  },

  createButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },

  createButtonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 23,
  },

  loginText: {
    fontSize: 15.5,
    color: '#7D8BA5',
    fontWeight: '400',
  },

  loginLink: {
    fontSize: 15.5,
    color: '#126AD1',
    fontWeight: '700',
  },
});
