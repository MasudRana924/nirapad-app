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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CreateAccountScreen = ({navigation}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
              <MaterialCommunityIcons
                name="arrow-left"
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

            {/* First + Last Name */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>First Name</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Rafiq"
                    placeholderTextColor="#8290A8"
                    value={form.firstName}
                    onChangeText={text =>
                      updateField('firstName', text)
                    }
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Last Name</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Hossain"
                    placeholderTextColor="#8290A8"
                    value={form.lastName}
                    onChangeText={text =>
                      updateField('lastName', text)
                    }
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={22}
                  color="#7D8BA2"
                  style={styles.leftIcon}
                />

                <TextInput
                  style={[styles.input, styles.iconInput]}
                  placeholder="+880 1XXX-XXXXXX"
                  placeholderTextColor="#8290A8"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={text =>
                    updateField('phone', text)
                  }
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email (optional)</Text>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="email-outline"
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
                <MaterialCommunityIcons
                  name="lock-outline"
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
                  <MaterialCommunityIcons
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
                  <MaterialCommunityIcons
                    name="check"
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
              onPress={() => {
                navigation?.navigate('VerifyPhone');
              }}>
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
    borderRadius: 18,
    backgroundColor: '#E9EEF5',
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
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#7D8BA5',
  },

  label: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '600',
    color: '#182331',
    marginBottom: 7,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },

  halfInput: {
    width: '48%',
  },

  field: {
    marginTop: 20,
  },

  inputContainer: {
    height: 54,
    borderRadius: 16,
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
    backgroundColor: '#2478D4',
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

  createButton: {
    height: 52,
    borderRadius: 17,
    backgroundColor: '#2478D4',
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
