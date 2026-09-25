import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../common/PrimaryButton';

const TEAL = '#008178';
const INK = '#163532';
const MUTED = '#7E9390';
const PAGE = '#EAF6F1';
const BORDER = '#C9DDD7';

const AuthLayout = ({
  children,
  title,
  subtitle,
  extra,
  langSwitch,
  showBack = false,
  onBack,
}) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE} />
      <View pointerEvents="none" style={styles.blobTop} />
      <View pointerEvents="none" style={styles.blobTopSoft} />
      <View pointerEvents="none" style={styles.blobBottomLeft} />
      <View pointerEvents="none" style={styles.blobBottomRight} />

      {/* Language switch pinned to top-right, below status bar / notch */}
      {langSwitch ? (
        <View
          style={[styles.langSwitchOverlay, {top: insets.top + 10}]}
          pointerEvents="box-none">
          {langSwitch}
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: Math.max(20, insets.top + 8),
              paddingBottom: Math.max(36, insets.bottom + 24),
            },
          ]}>
          {showBack ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={onBack}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="arrow-back" size={22} color={INK} />
            </TouchableOpacity>
          ) : null}

          <View style={styles.brand}>
            <Image
              source={require('../../assets/auth.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            {/* <Text style={styles.brandName}>Nirapod</Text> */}
            <Text style={styles.brandTagline}>{t('careForBetterTomorrow')}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {extra}
          <View style={styles.accent} />
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export const AuthField = ({icon, right, style, ...inputProps}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.inputRow,
        focused && styles.inputRowFocused,
        style,
      ]}>
      <Icon name={icon} size={18} color={MUTED} />
      <TextInput
        style={styles.input}
        placeholderTextColor={MUTED}
        {...inputProps}
        onFocus={event => {
          setFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          inputProps.onBlur?.(event);
        }}
      />
      {right}
    </View>
  );
};

export const AuthPrimaryButton = ({title, onPress, disabled, loading}) => (
  <PrimaryButton
    title={title}
    onPress={onPress}
    disabled={disabled}
    loading={loading}
  />
);

export const AuthOutlineButton = ({title, icon, onPress}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={styles.outlineButton}>
    {icon ? <Icon name={icon} size={18} color={TEAL} /> : null}
    <Text style={styles.outlineButtonText}>{title}</Text>
  </TouchableOpacity>
);

export const AuthOrDivider = () => {
  const {t} = useTranslation();
  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>{t('or')}</Text>
      <View style={styles.orLine} />
    </View>
  );
};

export const AuthFooterLink = ({prompt, actionLabel, onPress}) => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>{prompt}</Text>
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.footerLink}>{actionLabel}</Text>
    </TouchableOpacity>
  </View>
);

export default AuthLayout;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: PAGE,
    overflow: 'hidden',
  },
  langSwitchOverlay: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  blobTop: {
    position: 'absolute',
    top: -110,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(168, 214, 198, 0.55)',
  },
  blobTopSoft: {
    position: 'absolute',
    top: -40,
    right: -120,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(0, 129, 120, 0.08)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -90,
    left: -80,
    width: 280,
    height: 220,
    borderRadius: 140,
    backgroundColor: 'rgba(168, 214, 198, 0.45)',
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: -120,
    right: -40,
    width: 260,
    height: 240,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 129, 120, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginLeft: -8,
  },
  brand: {
    alignItems: 'flex-start',
    marginBottom: 28,
    marginTop: 8,
  },
  brandLogo: {
    width: 56,
    height: 56,
    marginBottom: 6,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: TEAL,
    letterSpacing: -0.4,
    marginTop: -2,
  },
  brandTagline: {
    marginTop: 2,
    fontSize: 12,
    fontStyle: 'italic',
    color: MUTED,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: MUTED,
    maxWidth: 280,
    marginBottom:25
  },
  // accent: {
  //   width: 42,
  //   height: 4,
  //   borderRadius: 2,
  //   backgroundColor: TEAL,
  //   marginTop: 16,
  //   marginBottom: 26,
  // },
  inputRow: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 10,
    marginBottom: 14,
  },
  inputRowFocused: {
    borderColor: TEAL,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: INK,
    paddingVertical: 0,
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#A9C5C2',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outlineButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: TEAL,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D7E6E2',
  },
  orText: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
    color: MUTED,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: TEAL,
  },
});
