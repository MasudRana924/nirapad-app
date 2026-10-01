import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import {useMyAccount} from '../api/queries';
import {useRefreshMyAccount, useUpdateMyAccount} from '../api/mutations';
import {getApiErrorMessage} from '../api/client';
import Header from '../components/common/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import DateOfBirthPicker from '../components/common/DateOfBirthPicker';
import {useAppModal} from '../contexts/ModalContext';
import {
  GENDERS,
  GENDER_LABEL_KEYS,
  formatDateOfBirth,
  parseIsoDate,
} from '../utils/account';

const FIELDS = ['name', 'gender', 'date_of_birth', 'address', 'emergency_contact'];
const NAME_MAX = 255;
const ADDRESS_MAX = 500;
const EMERGENCY_MAX = 20;
const PHONE_PATTERN = /^\+?[0-9\s-]*$/;

const toFormValues = account => ({
  name: account?.name || '',
  gender: GENDERS.includes(account?.gender) ? account.gender : null,
  date_of_birth: account?.date_of_birth
    ? String(account.date_of_birth).slice(0, 10)
    : '',
  address: account?.address || '',
  emergency_contact: account?.emergency_contact || '',
});

const normalize = (key, value) =>
  key === 'gender' ? value || null : String(value ?? '').trim();

const getChangedFields = (form, initial) => {
  const changes = {};
  FIELDS.forEach(key => {
    const next = normalize(key, form[key]);
    if (next === normalize(key, initial[key])) {
      return;
    }
    changes[key] = key === 'name' || next ? next : null;
  });
  return changes;
};

const fieldFromError = error => {
  const detail = Array.isArray(error?.errors) ? error.errors[0] : null;
  const named = detail?.field || detail?.path || detail?.param;
  if (FIELDS.includes(named)) {
    return named;
  }
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('date_of_birth') || message.includes('date of birth')) {
    return 'date_of_birth';
  }
  if (message.includes('gender')) {
    return 'gender';
  }
  if (message.includes('emergency')) {
    return 'emergency_contact';
  }
  if (message.includes('address')) {
    return 'address';
  }
  if (message.includes('name')) {
    return 'name';
  }
  return null;
};

const EditProfile = ({navigation}) => {
  const {t} = useTranslation();
  const {data: accountData} = useMyAccount({refetchOnMount: 'always'});
  const updateAccount = useUpdateMyAccount();
  const refreshAccount = useRefreshMyAccount();
  const account = accountData?.data;

  const touchedRef = useRef(false);
  const [initial, setInitial] = useState(() => toFormValues(account));
  const [form, setForm] = useState(() => toFormValues(account));
  const [errors, setErrors] = useState({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const {showModal} = useAppModal();

  useEffect(() => {
    if (!account || touchedRef.current) {
      return;
    }
    const values = toFormValues(account);
    setInitial(values);
    setForm(values);
  }, [account]);

  const changes = getChangedFields(form, initial);
  const hasChanges = Object.keys(changes).length > 0;
  const saving = updateAccount.isPending;

  const updateField = (key, value) => {
    touchedRef.current = true;
    setForm(prev => ({...prev, [key]: value}));
    if (errors[key]) {
      setErrors(prev => ({...prev, [key]: null}));
    }
  };

  const showError = message => {
    showModal({type: 'error', title: t('error'), message});
  };

  const validate = () => {
    const next = {};
    const name = form.name.trim();
    if (!name) {
      next.name = t('nameEmpty');
    } else if (name.length > NAME_MAX) {
      next.name = t('nameTooLong');
    }
    if (form.address.trim().length > ADDRESS_MAX) {
      next.address = t('addressTooLong');
    }
    const emergency = form.emergency_contact.trim();
    if (emergency.length > EMERGENCY_MAX || !PHONE_PATTERN.test(emergency)) {
      next.emergency_contact = t('emergencyContactInvalid');
    }
    const dob = parseIsoDate(form.date_of_birth);
    if (dob && dob > new Date()) {
      next.date_of_birth = t('dateOfBirthFuture');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!hasChanges || saving || !validate()) {
      return;
    }
    try {
      await updateAccount.mutateAsync(changes);
    } catch (error) {
      const message = getApiErrorMessage(error, t('failedToUpdateProfile'));
      const field = fieldFromError(error);
      if (field) {
        setErrors(prev => ({...prev, [field]: message}));
      } else {
        showError(message);
      }
      return;
    }
    try {
      await refreshAccount();
    } catch (error) {
      console.log('Refetch after profile update failed:', error?.message);
    }
    navigation?.goBack();
    showModal({type: 'success', title: t('success'), message: t('profileSaved')});
  };

  const renderError = key =>
    errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.flex}>
        <Header title={t('editProfile')} onBack={() => navigation?.goBack()} />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.photoWrap}>
            {account?.profile_photo ? (
              <Image source={{uri: account.profile_photo}} style={styles.photo} />
            ) : (
              <View style={styles.photoEmpty}>
                <Icon name="person-outline" size={34} color="#008178" />
              </View>
            )}
          </View>

          <Text style={styles.label}>{t('nameLabel')}</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            onChangeText={text => updateField('name', text)}
            placeholder={t('enterName')}
            placeholderTextColor="#8190A7"
            maxLength={NAME_MAX}
          />
          {renderError('name')}

          <Text style={styles.label}>{t('gender')}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.input,
              styles.pickerInput,
              genderOpen && styles.dropdownOpen,
              errors.gender && styles.inputError,
            ]}
            onPress={() => setGenderOpen(open => !open)}>
            <Text style={[styles.pickerText, !form.gender && styles.placeholderText]}>
              {form.gender ? t(GENDER_LABEL_KEYS[form.gender]) : t('selectGender')}
            </Text>
            <Icon
              name={genderOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#8190A7"
            />
          </TouchableOpacity>
          {genderOpen ? (
            <View style={styles.dropdownList}>
              {GENDERS.map((gender, index) => {
                const active = form.gender === gender;
                return (
                  <TouchableOpacity
                    key={gender}
                    activeOpacity={0.8}
                    style={[
                      styles.dropdownItem,
                      index > 0 && styles.dropdownItemBorder,
                      active && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      updateField('gender', gender);
                      setGenderOpen(false);
                    }}>
                    <Text
                      style={[styles.dropdownText, active && styles.dropdownTextActive]}>
                      {t(GENDER_LABEL_KEYS[gender])}
                    </Text>
                    {active ? <Icon name="checkmark" size={18} color="#008178" /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
          {renderError('gender')}

          <Text style={styles.label}>{t('dateOfBirthLabel')}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.input, styles.pickerInput, errors.date_of_birth && styles.inputError]}
            onPress={() => setPickerOpen(true)}>
            <Text
              style={[styles.pickerText, !form.date_of_birth && styles.placeholderText]}>
              {formatDateOfBirth(form.date_of_birth) || t('selectDateOfBirth')}
            </Text>
            <Icon name="calendar-outline" size={18} color="#8190A7" />
          </TouchableOpacity>
          {renderError('date_of_birth')}

          <Text style={styles.label}>{t('addressLabel')}</Text>
          <TextInput
            style={[styles.input, styles.multiline, errors.address && styles.inputError]}
            value={form.address}
            onChangeText={text => updateField('address', text)}
            placeholder={t('enterAddress')}
            placeholderTextColor="#8190A7"
            multiline
            maxLength={ADDRESS_MAX}
            textAlignVertical="top"
          />
          {renderError('address')}

          <Text style={styles.label}>{t('emergencyContactLabel')}</Text>
          <TextInput
            style={[styles.input, errors.emergency_contact && styles.inputError]}
            value={form.emergency_contact}
            onChangeText={text => updateField('emergency_contact', text)}
            placeholder={t('enterEmergencyContact')}
            placeholderTextColor="#8190A7"
            keyboardType="phone-pad"
            maxLength={EMERGENCY_MAX}
          />
          {renderError('emergency_contact')}

          <ReadOnlyField label={t('email')} value={account?.email} t={t} />
          <ReadOnlyField label={t('phone')} value={account?.phone} t={t} />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <PrimaryButton
            title={t('saveChanges')}
            onPress={handleSave}
            disabled={!hasChanges || saving}
            loading={saving}
          />
        </View>
      </KeyboardAvoidingView>

      <DateOfBirthPicker
        visible={pickerOpen}
        value={form.date_of_birth}
        onClose={() => setPickerOpen(false)}
        onConfirm={value => {
          setPickerOpen(false);
          updateField('date_of_birth', value);
        }}
      />
    </SafeAreaView>
  );
};

const ReadOnlyField = ({label, value, t}) => (
  <View style={styles.readOnlyBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.input, styles.readOnlyInput]}>
      <Text style={[styles.readOnlyText, !value && styles.placeholderText]}>
        {value || t('notSet')}
      </Text>
      <Icon name="lock-closed-outline" size={16} color="#A3B1AF" />
    </View>
    <Text style={styles.hintText}>{t('readOnlyField')}</Text>
  </View>
);

export default EditProfile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  photoWrap: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E6F4F3',
  },
  photoEmpty: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111820',
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111820',
    borderWidth: 1,
    borderColor: '#D4DCDA',
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#E34242',
    marginBottom: 4,
  },
  multiline: {
    minHeight: 96,
    paddingTop: 14,
    paddingBottom: 14,
  },
  pickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 15,
    color: '#111820',
  },
  placeholderText: {
    color: '#8190A7',
  },
  dropdownOpen: {
    borderColor: '#008178',
    marginBottom: 6,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#D4DCDA',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 16,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 14,
  },
  dropdownItemBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6ECEB',
  },
  dropdownItemActive: {
    backgroundColor: '#F2FAF8',
  },
  dropdownText: {
    fontSize: 15,
    color: '#111820',
  },
  dropdownTextActive: {
    color: '#008178',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#E34242',
    marginBottom: 12,
  },
  readOnlyBlock: {
    marginBottom: 4,
  },
  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F6F8F8',
    borderColor: '#E6ECEB',
    marginBottom: 4,
  },
  readOnlyText: {
    fontSize: 15,
    color: '#5C6B7A',
  },
  hintText: {
    fontSize: 12,
    color: '#A3B1AF',
    marginBottom: 12,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
});
