import React, {useState} from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomLoader from '../components/common/CustomLoader';
import {useUserProfile} from '../api/queries';
import {useUpdateProfile} from '../api/mutations';
import {getApiErrorMessage} from '../api/client';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from '../components/common/Toast';
import Header from '../components/common/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import {requestGalleryPermission} from '../utils/permissions';
import {useAppModal} from '../contexts/ModalContext';
import {useAuth} from '../context/AuthContext';
import {useTranslation} from 'react-i18next';

const LANG_KEY = 'app_language';

const EditProfile = ({navigation}) => {
  const {t} = useTranslation();
  const {data: profileData} = useUserProfile();
  const updateMutation = useUpdateProfile();
  const {showError} = useAppModal();
  const {updateUser} = useAuth();

  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
  });
  const [imageUri, setImageUri] = useState(null);
  const [pickedPhoto, setPickedPhoto] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    language_preference: 'en',
    emergency_contact: '',
    address: '',
    date_of_birth: '',
  });

  const user = profileData?.data || {};

  React.useEffect(() => {
    if (!user.name && !user.email) {
      return;
    }

    let cancelled = false;

    const hydrate = async () => {
      let language =
        user.language_preference === 'bn' || user.language_preference === 'en'
          ? user.language_preference
          : null;

      if (!language) {
        try {
          const saved = await AsyncStorage.getItem(LANG_KEY);
          if (saved === 'en' || saved === 'bn') {
            language = saved;
          }
        } catch (_) {
          // ignore storage read errors
        }
      }

      if (cancelled) {
        return;
      }

      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        language_preference: language || 'en',
        emergency_contact: user.emergency_contact || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth
          ? String(user.date_of_birth).split('T')[0]
          : '',
      });

      if (user.profile_photo) {
        setImageUri(user.profile_photo);
      }
    };

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [
    user.name,
    user.email,
    user.phone,
    user.language_preference,
    user.emergency_contact,
    user.address,
    user.date_of_birth,
    user.profile_photo,
  ]);

  const updateField = (key, value) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleImagePick = async () => {
    try {
      const granted = await requestGalleryPermission();
      if (!granted) {
        showError(
          t('pleaseAllowPhotoAccess'),
          t('permissionRequired')
        );
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        showError(result.errorMessage || t('failedToOpenImagePicker'));
        return;
      }

      const asset = result.assets?.[0];
      if (asset?.uri) {
        setImageUri(asset.uri);
        setPickedPhoto(asset);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showError(t('failedToOpenImagePicker'));
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({visible: true, message, type});
  };

  const handleSaveProfile = async () => {
    const {
      name,
      email,
      phone,
      language_preference,
      emergency_contact,
      address,
      date_of_birth,
    } = formData;

    if (!name.trim()) {
      showError(t('enterName'));
      return;
    }
    if (!email.trim()) {
      showError(t('enterEmail'));
      return;
    }

    try {
      // PUT /api/v1/user/profile — multipart/form-data (any updated fields)
      const data = new FormData();
      data.append('name', name.trim());
      data.append('email', email.trim());
      data.append('phone', phone.trim());
      data.append('language_preference', language_preference || 'en');
      data.append('emergency_contact', emergency_contact.trim());
      data.append('address', address.trim());
      data.append('date_of_birth', date_of_birth.trim());

      if (pickedPhoto?.uri) {
        data.append('profile_photo', {
          uri: pickedPhoto.uri,
          type: pickedPhoto.type || 'image/jpeg',
          name: pickedPhoto.fileName || 'profile_photo.jpg',
        });
      }

      const response = await updateMutation.mutateAsync(data);

      try {
        await AsyncStorage.setItem(
          LANG_KEY,
          language_preference === 'bn' ? 'bn' : 'en',
        );
      } catch (_) {
        // ignore storage write errors
      }

      // Update user state with the new profile data
      if (response?.data) {
        updateUser(response.data);
      }

      showToast(t('profileUpdated'));
      navigation?.goBack();
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast(
        getApiErrorMessage(error, t('failedToUpdateProfile')),
        'error',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <CustomLoader overlay visible={updateMutation.isPending} />
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
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.photoWrap}
            onPress={handleImagePick}>
            {imageUri ? (
              <Image source={{uri: imageUri}} style={styles.photo} />
            ) : (
              <View style={styles.photoEmpty}>
                <Icon name="camera-outline" size={28} color="#008178" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Icon name="pencil" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>{t('tapToChangePhoto')}</Text>

          <Text style={styles.label}>{t('nameLabel')}</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={text => updateField('name', text)}
            placeholder={t('enterName')}
            placeholderTextColor="#8190A7"
          />

          <Text style={styles.label}>{t('emailLabel')}</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={text => updateField('email', text)}
            placeholder={t('enterEmail')}
            placeholderTextColor="#8190A7"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t('phoneLabel')}</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={text => updateField('phone', text)}
            placeholder={t('enterPhoneNumber')}
            placeholderTextColor="#8190A7"
            keyboardType="phone-pad"
          />
{/* 
          <Text style={styles.label}>Emergency contact</Text>
          <TextInput
            style={styles.input}
            value={formData.emergency_contact}
            onChangeText={text => updateField('emergency_contact', text)}
            placeholder="Enter emergency contact"
            placeholderTextColor="#8190A7"
            keyboardType="phone-pad"
          /> */}

          <Text style={styles.label}>{t('addressLabel')}</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={text => updateField('address', text)}
            placeholder={t('enterAddress')}
            placeholderTextColor="#8190A7"
          />

          <Text style={styles.label}>{t('dateOfBirthLabel')}</Text>
          <TextInput
            style={styles.input}
            value={formData.date_of_birth}
            onChangeText={text => updateField('date_of_birth', text)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#8190A7"
          />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <PrimaryButton
            title={t('saveChanges')}
            onPress={handleSaveProfile}
            disabled={updateMutation.isPending}
            loading={updateMutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({...toast, visible: false})}
      />
    </SafeAreaView>
  );
};

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
    width: 96,
    height: 96,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  photoEmpty: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoHint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8190A7',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111820',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#F6F6F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111820',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    marginBottom: 16,
  },
  langSwitch: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  langOption: {
    minWidth: 56,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  langOptionActive: {
    backgroundColor: '#008178',
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8190A7',
  },
  langTextActive: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
});
