import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const OTP_LENGTH = 6;

const VerifyPhoneScreen = ({navigation, route}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(42);

  const inputs = useRef([]);

  // Countdown
  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleOtpChange = (value, index) => {
    const numericValue = value.replace(/[^0-9]/g, '');

    const newOtp = [...otp];

    if (!numericValue) {
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    newOtp[index] = numericValue.charAt(numericValue.length - 1);

    setOtp(newOtp);

    if (index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = ({nativeEvent}, index) => {
    if (
      nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (seconds > 0) {
      return;
    }

    setSeconds(42);
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== OTP_LENGTH) {
      return;
    }

    console.log('OTP:', enteredOtp);
    navigation?.navigate('Main');
  };

  const isOtpComplete = otp.every(value => value !== '');

  const phoneNumber =
    route?.params?.phoneNumber || '+880 1712-345678';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FC"
      />

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

      {/* Main */}
      <View style={styles.container}>

        {/* Title */}
        <Text style={styles.title}>
          Verify Phone
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          We sent a 6-digit code to
        </Text>

        <Text style={styles.phoneNumber}>
          {phoneNumber}
        </Text>

        {/* OTP */}
        <View style={styles.otpContainer}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputs.current[index] = ref;
              }}
              value={value}
              onChangeText={text =>
                handleOtpChange(text, index)
              }
              onKeyPress={event =>
                handleKeyPress(event, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor="#1473DC"
              style={[
                styles.otpInput,
                value
                  ? styles.otpInputActive
                  : styles.otpInputEmpty,
              ]}
            />
          ))}
        </View>

        {/* Resend */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code?{' '}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={seconds > 0}
            onPress={handleResend}>
            <Text
              style={[
                styles.resendLink,
                seconds > 0 && styles.resendLinkDisabled,
              ]}>
              {seconds > 0
                ? `Resend in 0:${String(seconds).padStart(2, '0')}`
                : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!isOtpComplete}
          onPress={handleVerify}
          style={[
            styles.verifyButton,
            !isOtpComplete && styles.verifyButtonDisabled,
          ]}>
          <Text style={styles.verifyButtonText}>
            Verify
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default VerifyPhoneScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },

  header: {
    height: 52,
    backgroundColor: '#F8F9FC',
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
    flex: 1,
    paddingHorizontal: 28,
  },

  title: {
    marginTop: 29,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '700',
    color: '#182331',
    letterSpacing: -0.4,
  },

  description: {
    marginTop: 13,
    fontSize: 16,
    lineHeight: 22,
    color: '#7D8BA5',
    fontWeight: '400',
  },

  phoneNumber: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 23,
    color: '#182331',
    fontWeight: '700',
  },

  otpContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 38,
  },

  otpInput: {
    width: 54,
    height: 61,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '600',
    padding: 0,
  },

  otpInputActive: {
    backgroundColor: '#F0F5FC',
    borderWidth: 2,
    borderColor: '#F0F5FC',
    color: '#1473DC',
  },

  otpInputEmpty: {
    backgroundColor: '#F0F2F7',
    borderWidth: 2,
    borderColor: '#F0F2F7',
    color: '#7D8BA5',
  },

  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 27,
  },

  resendText: {
    fontSize: 14.5,
    lineHeight: 20,
    color: '#7D8BA5',
    fontWeight: '400',
  },

  resendLink: {
    fontSize: 14.5,
    lineHeight: 20,
    color: '#1473DC',
    fontWeight: '700',
  },

  resendLinkDisabled: {
    color: '#1473DC',
  },

  verifyButton: {
    width: '100%',
    height: 54,
    borderRadius: 17,
    backgroundColor: '#2478D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 44,
  },

  verifyButtonDisabled: {
    backgroundColor: '#A8C8EE',
  },

  verifyButtonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
