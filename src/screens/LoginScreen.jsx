import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <SafeAreaView style={styles.safeArea}>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >

          {/* ================= HEADER ================= */}

          <View style={styles.header}>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={() => navigation?.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color="#111827"
              />
            </TouchableOpacity>

          </View>

          {/* ================= CONTENT ================= */}

          <View style={styles.content}>

            {/* Title */}

            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.subtitle}>
              Login to manage care for your loved ones
            </Text>


            {/* ================= PHONE ================= */}

            <View style={styles.inputGroup}>

              <Text style={styles.label}>
                Phone Number
              </Text>

              <View style={styles.inputContainer}>

                <Ionicons
                  name="call-outline"
                  size={22}
                  color="#7D8BA3"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+880 1XXX-XXXXXX"
                  placeholderTextColor="#7D8BA3"
                  keyboardType="phone-pad"
                  maxLength={15}
                />

              </View>

            </View>


            {/* ================= PASSWORD ================= */}

            <View style={styles.inputGroupPassword}>

              <Text style={styles.label}>
                Password
              </Text>

              <View style={styles.inputContainer}>

                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#7D8BA3"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#7D8BA3"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-outline'
                        : 'eye-off-outline'
                    }
                    size={22}
                    color="#7D8BA3"
                  />
                </TouchableOpacity>

              </View>

            </View>


            {/* ================= FORGOT PASSWORD ================= */}

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.forgotButton}
              onPress={() => navigation?.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>


            {/* ================= LOGIN BUTTON ================= */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.loginButton}
              onPress={() => {
                navigation?.navigate('Main');
              }}
            >
              <Text style={styles.loginButtonText}>
                Login
              </Text>
            </TouchableOpacity>


            {/* ================= OR ================= */}

            <View style={styles.orContainer}>

              <View style={styles.orLine} />

              <Text style={styles.orText}>
                or continue with
              </Text>

              <View style={styles.orLine} />

            </View>


            {/* ================= BIOMETRIC ================= */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.biometricButton}
              onPress={() => {
                // Biometric login
              }}
            >

              <View style={styles.fingerprintCircle}>

                <MaterialCommunityIcons
                  name="fingerprint"
                  size={25}
                  color="#FFFFFF"
                />

              </View>

              <Text style={styles.biometricText}>
                Biometric Login
              </Text>

            </TouchableOpacity>

          </View>


          {/* ================= REGISTER ================= */}

          <View style={styles.registerContainer}>

            <Text style={styles.registerText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation?.navigate('Register')}
            >
              <Text style={styles.registerLink}>
                Register
              </Text>
            </TouchableOpacity>

          </View>

        </KeyboardAvoidingView>

      </SafeAreaView>

    </View>
  );
};

export default LoginScreen;


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    height: 51,
    justifyContent: 'center',

    paddingHorizontal: 16,
  },

  backButton: {
    width: 36,
    height: 36,

    borderRadius: 20,

    backgroundColor: '#EDF1F7',

    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    width: '90%',

    alignSelf: 'center',

    paddingTop: 22,
  },

  title: {
    fontSize: 29,

    lineHeight: 36,

    fontWeight: '700',

    color: '#111827',

    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 5,

    fontSize: 16,

    lineHeight: 24,

    color: '#7C89A1',

    fontWeight: '400',
  },

  inputGroup: {
    marginTop: 28,
  },

  inputGroupPassword: {
    marginTop: 19,
  },

  label: {
    fontSize: 15,

    lineHeight: 20,

    fontWeight: '600',

    color: '#172033',

    marginBottom: 8,
  },

  inputContainer: {
    height: 50,

    width: '100%',

    borderRadius: 17,

    backgroundColor: '#EFF2F7',

    borderWidth: 1,

    borderColor: '#EFF2F7',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 14,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,

    height: '100%',

    fontSize: 16,

    color: '#1B2535',

    paddingVertical: 0,
  },

  eyeButton: {
    width: 35,
    height: 45,

    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotButton: {
    alignSelf: 'flex-end',

    marginTop: 17,
  },

  forgotText: {
    fontSize: 14.5,

    fontWeight: '600',

    color: '#1976D2',
  },

  loginButton: {
    width: '100%',

    height: 53,

    borderRadius: 17,

    backgroundColor: '#2474D4',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 28,
  },

  loginButtonText: {
    fontSize: 17,

    fontWeight: '600',

    color: '#FFFFFF',
  },

  orContainer: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 30,
  },

  orLine: {
    flex: 1,

    height: 1,

    backgroundColor: '#DFE4EC',
  },

  orText: {
    marginHorizontal: 14,

    fontSize: 14,

    color: '#7F8CA2',

    fontWeight: '400',
  },

  biometricButton: {
    width: '100%',

    height: 54,

    borderRadius: 17,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#DEE4ED',

    marginTop: 29,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  fingerprintCircle: {
    width: 22,

    height: 22,

    borderRadius: 12,

    backgroundColor: '#16B890',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 12,
  },

  biometricText: {
    fontSize: 16,

    fontWeight: '600',

    color: '#172033',
  },

  registerContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 34,
    marginTop: 20,
  },

  registerText: {
    fontSize: 15,

    color: '#7E8BA1',

    fontWeight: '400',
  },

  registerLink: {
    fontSize: 15,

    color: '#1976D2',

    fontWeight: '600',

    marginLeft: 4,
  },

});
