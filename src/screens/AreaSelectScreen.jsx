import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import SearchableDropdown from '../components/common/SearchableDropdown';
import PrimaryButton from '../components/common/PrimaryButton';
import {useAppModal} from '../contexts/ModalContext';
import {bangladeshDistricts} from '../data/bangladeshLocations';
import {getThanasByDistrict} from '../data/bangladeshThanas';
import {storage} from '../utils/storage';

const TEAL = '#008178';
const INK = '#163532';
const MUTED = '#7B9390';
const ADDRESS_MAX = 200;

const FieldLabel = ({icon, title}) => (
  <View style={styles.fieldLabelRow}>
    <View style={styles.fieldIcon}>
      <Icon name={icon} size={16} color={TEAL} />
    </View>
    <Text style={styles.fieldLabel}>{title}</Text>
  </View>
);

const AreaSelectScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {showError} = useAppModal();
  const {
    selectedMember,
    selectedService,
    serviceType = 'caregiver',
  } = route.params || {};
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  const thanaOptions = useMemo(() => getThanasByDistrict(district), [district]);

  const {t} = useTranslation();

  const handleDistrictSelect = value => {
    setDistrict(value);
    setThana('');
  };

  const canContinue = !!district && !!thana && !!fullAddress.trim();

  const handleNext = async () => {
    if (!district || !thana) {
      showError('Please select both district and thana', t('selectArea'));
      return;
    }
    if (!fullAddress.trim()) {
      showError('Please enter your full address', 'Full address');
      return;
    }

    const selectedArea = {
      district,
      thana,
      fullAddress: fullAddress.trim(),
    };
    await storage.saveSelectedArea(selectedArea);

    navigation?.navigate('SelectCaregiver', {
      selectedMember,
      selectedService,
      selectedArea,
      district,
      thana,
      serviceType,
    });
  };

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation?.goBack()}>
            <Icon name="arrow-back" size={22} color={INK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('selectArea')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <View style={styles.heroCopy}>
                <View style={styles.heroTitleRow}>
                  <View style={styles.heroIcon}>
                    <Icon name="location" size={18} color={TEAL} />
                  </View>
                  <Text style={styles.heroTitle}>Where do you need care?</Text>
                </View>
                <Text style={styles.heroText}>
                  Select district, thana and enter your full address to find the
                  best caregiver near you.
                </Text>
              </View>
              <Image
                source={require('../assets/location-hero.png')}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>

            <FieldLabel icon="home-outline" title={t('district')} />
            <SearchableDropdown
              data={bangladeshDistricts}
              placeholder={t('selectDistrict')}
              value={district}
              onSelect={handleDistrictSelect}
              icon="business-outline"
              variant="light"
            />

            <View style={styles.fieldGap} />

            <FieldLabel icon="location-outline" title={t('thana')} />
            <SearchableDropdown
              data={thanaOptions}
              placeholder={district ? t('selectThana') : 'Select district first'}
              value={thana}
              onSelect={setThana}
              icon="location-outline"
              variant="light"
            />

            <View style={styles.fieldGap} />

            <FieldLabel icon="home-outline" title="Full address" />
            <View style={styles.addressBox}>
              <Icon
                name="home-outline"
                size={18}
                color={MUTED}
                style={styles.addressIcon}
              />
              <TextInput
                style={styles.addressInput}
                placeholder="House, road, block, landmark..."
                placeholderTextColor={MUTED}
                value={fullAddress}
                onChangeText={setFullAddress}
                multiline
                maxLength={ADDRESS_MAX}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.counter}>
              {fullAddress.length}/{ADDRESS_MAX}
            </Text>
          </ScrollView>

          <View
            style={[
              styles.bottomContainer,
              {paddingBottom: Math.max(16, insets.bottom + 8)},
            ]}>
            <PrimaryButton
              title={t('next')}
              onPress={handleNext}
              disabled={!canContinue}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default AreaSelectScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    minHeight: 44,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: INK,
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    marginTop: 8,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 8,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: INK,
  },
  heroText: {
    fontSize: 13,
    lineHeight: 19,
    color: MUTED,
  },
  heroImage: {
    width: 108,
    height: 108,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  fieldIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },
  fieldGap: {
    height: 18,
  },
  addressBox: {
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCEEE9',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addressIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  addressInput: {
    flex: 1,
    minHeight: 86,
    fontSize: 15,
    color: INK,
    padding: 0,
  },
  counter: {
    marginTop: 8,
    textAlign: 'right',
    fontSize: 12,
    color: MUTED,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
