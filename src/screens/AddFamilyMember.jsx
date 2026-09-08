import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAddFamilyMember, useUpdateFamilyMember} from '../api/mutations';
import {useFamilyMember} from '../api/queries';
import Toast from '../components/common/Toast';
import Header from '../components/common/Header';
import {requestGalleryPermission} from '../utils/permissions';

const AddFamilyMember = ({navigation, route}) => {
  const {memberId, redirectBack} = route.params || {};
  const isEditMode = !!memberId;

  const addMutation = useAddFamilyMember();
  const updateMutation = useUpdateFamilyMember();
  const {data: memberData} = useFamilyMember(isEditMode ? memberId : null);

  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
  });
  const [imageUri, setImageUri] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    blood_group: '',
    date_of_birth: '',
    description: '',
  });

  useEffect(() => {
    if (isEditMode && memberData?.data) {
      const member = memberData.data;
      setFormData({
        name: member.name || '',
        relationship: member.relationship || '',
        phone: member.emergency_contact_phone || '',
        blood_group: member.blood_group || '',
        date_of_birth: member.date_of_birth
          ? String(member.date_of_birth).split('T')[0]
          : '',
        description: member.medical_history || '',
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
        Alert.alert(
          'Permission Required',
          'Please allow photo library access to add a photo.',
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
        Alert.alert(
          'Error',
          result.errorMessage || 'Failed to open image picker',
        );
        return;
      }
      if (result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({visible: true, message, type});
  };

  const handleSubmit = async () => {
    const {name, relationship, phone, blood_group, date_of_birth, description} =
      formData;

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter name');
      return;
    }
    if (!relationship.trim()) {
      Alert.alert('Error', 'Please enter relationship');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    try {
      const data = new FormData();
      data.append('name', name);
      data.append('relationship', relationship);
      data.append('phone', phone);
      if (blood_group) data.append('blood_group', blood_group);
      if (date_of_birth) data.append('date_of_birth', date_of_birth);
      if (description) data.append('description', description);

      if (imageUri) {
        data.append('photo', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
      }

      if (isEditMode) {
        await updateMutation.mutateAsync({id: memberId, formData: data});
        showToast('Family member updated successfully');
      } else {
        await addMutation.mutateAsync(data);
        showToast('Family member added successfully');
      }
      navigation?.goBack();
    } catch (error) {
      console.error('Failed to save family member:', error);
      showToast(
        isEditMode
          ? 'Failed to update family member'
          : 'Failed to add family member',
        'error',
      );
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <Header
          title={isEditMode ? 'Edit family member' : 'Add family member'}
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
          <Text style={styles.photoHint}>Tap to add photo</Text>

          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={text => setFormData({...formData, name: text})}
            placeholder="Enter name"
            placeholderTextColor="#8190A7"
          />

          <Text style={styles.label}>Relationship *</Text>
          <TextInput
            style={styles.input}
            value={formData.relationship}
            onChangeText={text =>
              setFormData({...formData, relationship: text})
            }
            placeholder="e.g. Father, Mother, Spouse"
            placeholderTextColor="#8190A7"
          />

          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={text => setFormData({...formData, phone: text})}
            placeholder="Enter phone number"
            placeholderTextColor="#8190A7"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Blood group</Text>
          <TextInput
            style={styles.input}
            value={formData.blood_group}
            onChangeText={text =>
              setFormData({...formData, blood_group: text})
            }
            placeholder="e.g. O+, A+, B+"
            placeholderTextColor="#8190A7"
          />

          <Text style={styles.label}>Date of birth</Text>
          <TextInput
            style={styles.input}
            value={formData.date_of_birth}
            onChangeText={text =>
              setFormData({...formData, date_of_birth: text})
            }
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#8190A7"
          />

          <Text style={styles.label}>Medical history</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={text =>
              setFormData({...formData, description: text})
            }
            placeholder="Notes or medical information"
            placeholderTextColor="#8190A7"
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitButton, isPending && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isPending}>
            <Text style={styles.submitButtonText}>
              {isPending
                ? isEditMode
                  ? 'Updating...'
                  : 'Adding...'
                : isEditMode
                  ? 'Update member'
                  : 'Add member'}
            </Text>
          </TouchableOpacity>
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
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#008178',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#B5C0D0',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
