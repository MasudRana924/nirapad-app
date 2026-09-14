import React from 'react';
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
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const TEAL = '#008178';
const INK = '#1B3330';
const MUTED = '#7E9390';
const PAGE = '#E8F4EE';

const AuthLayout = ({
  children,
  title,
  subtitle,
  extra,
  showBack = false,
  onBack,
  compactHero = false,
}) => {
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();
  const heroHeight = compactHero
    ? Math.min(width * 0.52, height * 0.28)
    : Math.min(width * 0.7, height * 0.36);

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={[
            styles.scroll,
            {paddingBottom: Math.max(28, insets.bottom + 18)},
          ]}>
          <View style={[styles.hero, {height: heroHeight}]}>
            <Image
              source={require('../../assets/auth-hero.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />

            <SafeAreaView edges={['top']} style={styles.heroOverlay}>
              <View style={styles.heroTopRow}>
                {showBack ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.backButton}
                    onPress={onBack}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Icon name="arrow-back" size={20} color={INK} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.backPlaceholder} />
                )}
                <View style={styles.taglineBlock}>
                  <Text style={styles.tagline}>Better Care</Text>
                  <View style={styles.taglineRow}>
                    <Text style={styles.tagline}>Happier Days</Text>
                    <Icon name="heart" size={11} color={TEAL} />
                  </View>
                </View>
              </View>

              {compactHero ? null : (
                <View style={styles.heroCopy}>
                  <Text style={styles.heroTitle}>
                    Trusted Care for{'\n'}your Loved Ones
                  </Text>
                  <Text style={styles.heroSubtitle}>
                    Book verified caregivers and nurses for your family's better
                    tomorrow.
                  </Text>
                </View>
              )}
            </SafeAreaView>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {extra}
            <View style={styles.accent} />
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View pointerEvents="none" style={styles.leafLeft}>
        <Icon name="leaf" size={86} color="rgba(0,129,120,0.14)" />
      </View>
      <View pointerEvents="none" style={styles.leafRight}>
        <Icon name="leaf" size={72} color="rgba(0,129,120,0.12)" />
      </View>
      <View pointerEvents="none" style={styles.heartDecor}>
        <Icon name="heart-outline" size={18} color="rgba(0,129,120,0.28)" />
      </View>
    </View>
  );
};

export const AuthField = ({icon, right, style, ...inputProps}) => (
  <View style={[styles.inputRow, style]}>
    <Icon name={icon} size={18} color={MUTED} />
    <TextInput
      style={styles.input}
      placeholderTextColor={MUTED}
      {...inputProps}
    />
    {right}
  </View>
);

export const AuthPrimaryButton = ({title, onPress, disabled}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    disabled={disabled}
    onPress={onPress}
    style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}>
    <Text style={styles.primaryButtonText}>{title}</Text>
    {/* <Icon name="arrow-forward" size={18} color="#FFFFFF" /> */}
  </TouchableOpacity>
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

export const AuthOrDivider = () => (
  <View style={styles.orRow}>
    <View style={styles.orLine} />
    <Text style={styles.orText}>OR</Text>
    <View style={styles.orLine} />
  </View>
);

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
  },
  flex: {
    flex: 1,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: PAGE,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  backPlaceholder: {
    width: 38,
  },
  taglineBlock: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagline: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '600',
    color: TEAL,
    lineHeight: 18,
  },
  heroCopy: {
    marginTop: 16,
    maxWidth: 168,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: '#5F746F',
  },
  scroll: {
    flexGrow: 1,
  },
  card: {
    marginTop: -42,
    marginHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    shadowColor: '#0B3D38',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  accent: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: TEAL,
    marginTop: 12,
    marginBottom: 22,
  },
  inputRow: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F6F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: INK,
    paddingVertical: 0,
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
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
    height: 52,
    borderRadius: 26,
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
    backgroundColor: '#E4EEEC',
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
    marginTop: 16,
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
  leafLeft: {
    position: 'absolute',
    bottom: 6,
    left: -12,
    transform: [{rotate: '-24deg'}],
  },
  leafRight: {
    position: 'absolute',
    bottom: 2,
    right: -8,
    transform: [{rotate: '125deg'}],
  },
  heartDecor: {
    position: 'absolute',
    bottom: 18,
    right: 78,
  },
});
