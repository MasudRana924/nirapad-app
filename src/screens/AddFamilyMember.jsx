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
  const {data: memberData, isLoading: isLoadingMember} = useFamilyMember(isEditMode ? memberId : null);
  
  const [toast, setToast] = useState({visible: false, message: '', type: 'success'});
  const [imageUri, setImageUri] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    blood_group: '',
    date_of_birth: '',
    description: '',
  });

  // Populate form when member data loads in edit mode
  useEffect(() => {
    if (isEditMode && memberData?.data) {
      const member = memberData.data;
      setFormData({
        name: member.name || '',
        relationship: member.relationship || '',
        phone: member.emergency_contact_phone || '',
        blood_group: member.blood_group || '',
        date_of_birth: member.date_of_birth ? String(member.date_of_birth).split('T')[0] : '',
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

      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to open image picker');
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
    const {name, relationship, phone, blood_group, date_of_birth, description} = formData;

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
        navigation?.goBack();
      } else {
        await addMutation.mutateAsync(data);
        showToast('Family member added successfully');
        if (redirectBack === 'SelectFamilyMember') {
          navigation?.goBack();
        } else {
          navigation?.goBack();
        }
      }
    } catch (error) {
      console.error('Failed to save family member:', error);
      showToast(isEditMode ? 'Failed to update family member' : 'Failed to add family member', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}>
        <Header 
          title={isEditMode ? 'Edit Family Member' : 'Add Family Member'} 
          onBack={() => navigation?.goBack()} 
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Image Upload */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.imageUploadContainer}
            onPress={handleImagePick}>
            {imageUri ? (
              <Image source={{uri: imageUri}} style={styles.uploadedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="camera-outline" size={32} color="#8190A7" />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={text => setFormData({...formData, name: text})}
                placeholder="Enter name"
                placeholderTextColor="#8190A7"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Relationship *</Text>
              <TextInput
                style={styles.input}
                value={formData.relationship}
                onChangeText={text => setFormData({...formData, relationship: text})}
                placeholder="e.g., Father, Mother, Spouse"
                placeholderTextColor="#8190A7"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={text => setFormData({...formData, phone: text})}
                placeholder="Enter phone number"
                placeholderTextColor="#8190A7"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Blood Group</Text>
              <TextInput
                style={styles.input}
                value={formData.blood_group}
                onChangeText={text => setFormData({...formData, blood_group: text})}
                placeholder="e.g., O+, A+, B+"
                placeholderTextColor="#8190A7"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={formData.date_of_birth}
                onChangeText={text => setFormData({...formData, date_of_birth: text})}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8190A7"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medical History / Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={text => setFormData({...formData, description: text})}
                placeholder="Medical notes or other information"
                placeholderTextColor="#8190A7"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </ScrollView>

        {/* Submit Button — pinned to bottom, full width */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.submitButton, (addMutation.isPending || updateMutation.isPending) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={addMutation.isPending || updateMutation.isPending}>
            <Text style={styles.submitButtonText}>
              {(addMutation.isPending || updateMutation.isPending) 
                ? (isEditMode ? 'Updating...' : 'Adding...') 
                : (isEditMode ? 'Update Member' : 'Add Member')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({...toast, visible: false})}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  keyboardContainer: {
    flex: 1,
  },

  // ================= SCROLL =================
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // ================= IMAGE UPLOAD =================
  imageUploadContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },

  uploadedImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D8E7FA',
    borderStyle: 'dashed',
  },

  imagePlaceholderText: {
    fontSize: 12,
    color: '#8190A7',
    marginTop: 8,
  },

  // ================= FORM =================
  formContainer: {
    marginTop: 8,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172333',
    marginBottom: 8,
  },

  input: {
    height: 50,
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#172333',
    borderWidth: 1,
    borderColor: '#F6F6F6',
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // ================= BOTTOM =================
  bottomContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    // paddingBottom: 16,
  },

  submitButton: {
    width: '100%',
    height: 53,
    backgroundColor: '#008178',
    borderRadius: 12,
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

export default AddFamilyMember;
