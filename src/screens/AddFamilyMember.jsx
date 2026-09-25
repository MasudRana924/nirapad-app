import React, {useState, useEffect} from 'react';
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
import Loader from '../components/common/Loader';
import SearchableDropdown from '../components/common/SearchableDropdown';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAddFamilyMember, useUpdateFamilyMember} from '../api/mutations';
import {useFamilyMember} from '../api/queries';
import Toast from '../components/common/Toast';
import Header from '../components/common/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import {requestGalleryPermission} from '../utils/permissions';
import FamilyDetailsSkeleton from '../components/home/FamilyDetailsSkeleton';
import {useAppModal} from '../contexts/ModalContext';
import {useTranslation} from 'react-i18next';

const capitalize = value =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';

const AddFamilyMember = ({navigation, route}) => {
  const {t} = useTranslation();
  
  const RELATIONSHIPS = [
    'Father',
    'Mother',
    'Spouse',
    'Son',
    'Daughter',
    'Brother',
    'Sister',
    'Grandfather',
    'Grandmother',
    'Other',
  ];
  const GENDERS = ['Male', 'Female', 'Other'];

  const {memberId} = route.params || {};
  const isEditMode = !!memberId;

  const addMutation = useAddFamilyMember();
  const updateMutation = useUpdateFamilyMember();
  const {showError} = useAppModal();
  const {data: memberData, isLoading: memberLoading} = useFamilyMember(
    isEditMode ? memberId : null,
  );

  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
  });
  const [imageUri, setImageUri] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    gender: '',
  });

  useEffect(() => {
    if (isEditMode && memberData?.data) {
      const member = memberData.data;
      setFormData({
        name: member.name || '',
        relationship: member.relationship || '',
        gender: capitalize(member.gender),
      });
      if (member.photo) {
        setImageUri(member.photo);
      }
    }
  }, [isEditMode, memberData]);

  const handleImagePick = async () => {
    try {
      const granted = await requestGalleryPermission();
      if (!granted) {
        showError(
          t('pleaseAllowPhotoAccessFamily'),
          t('permissionRequired'),
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
        showError(result.errorMessage || 'Failed to open image picker');
        return;
      }
      if (result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showError('Failed to open image picker');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({visible: true, message, type});
  };

  const handleSubmit = async () => {
    const {name, relationship, gender} = formData;

    if (!name.trim()) {
      showError(t('pleaseEnterName'));
      return;
    }
    if (!relationship.trim()) {
      showError(t('pleaseSelectRelationship'));
      return;
    }
    if (!gender.trim()) {
      showError(t('pleaseSelectGender'));
      return;
    }

    try {
      const data = new FormData();
      data.append('name', name);
      data.append('relationship', relationship);
      data.append('gender', gender.toLowerCase());

      if (imageUri && !String(imageUri).startsWith('http')) {
        data.append('photo', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
      }

      if (isEditMode) {
        await updateMutation.mutateAsync({id: memberId, formData: data});
        showToast(t('familyMemberUpdated'));
      } else {
        await addMutation.mutateAsync(data);
        showToast(t('familyMemberAdded'));
      }
      navigation?.goBack();
    } catch (error) {
      console.error('Failed to save family member:', error);
      showToast(
        error?.message ||
          (isEditMode
            ? t('failedToUpdateFamilyMember')
            : t('failedToAddFamilyMember')),
        'error',
      );
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  if (isEditMode && memberLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <Header
          title={t('editFamilyMember')}
          onBack={() => navigation?.goBack()}
        />
        <FamilyDetailsSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Loader visible={isPending} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <Header
          title={isEditMode ? t('editFamilyMember') : t('addFamilyMemberTitle')}
          onBack={() => navigation?.goBack()}
        />

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
          <Text style={styles.photoHint}>{t('tapToAddPhoto')}</Text>

          <Text style={styles.label}>{t('nameRequired')}</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={text => setFormData({...formData, name: text})}
            placeholder={t('pleaseEnterName')}
            placeholderTextColor="#8190A7"
          />

          <Text style={styles.label}>{t('relationshipRequired')}</Text>
          <SearchableDropdown
            data={RELATIONSHIPS}
            placeholder={t('selectRelationship')}
            value={formData.relationship}
            onSelect={value => setFormData({...formData, relationship: value})}
            icon="person-outline"
          />

          <Text style={styles.label}>{t('genderRequired')}</Text>
          <SearchableDropdown
            data={GENDERS}
            placeholder={t('selectGender')}
            value={formData.gender}
            onSelect={value => setFormData({...formData, gender: value})}
            icon="male-female-outline"
          />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <PrimaryButton
            title={isEditMode ? t('updateMember') : t('addMember')}
            onPress={handleSubmit}
            disabled={isPending}
            loading={isPending}
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

export default AddFamilyMember;

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
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#008178',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
