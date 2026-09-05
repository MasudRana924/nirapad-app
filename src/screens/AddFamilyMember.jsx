import React, {useState} from 'react';
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
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAddFamilyMember} from '../api/mutations';
import Toast from '../components/common/Toast';

const AddFamilyMember = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const addMutation = useAddFamilyMember();
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

  const handleImagePick = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
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

      await addMutation.mutateAsync(data);
      showToast('Family member added successfully');
      navigation?.goBack();
    } catch (error) {
      console.error('Failed to add family member:', error);
      showToast('Failed to add family member', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'undefined'}
        style={styles.keyboardContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation?.goBack()}>
            <Icon name="arrow-back" size={24} color="#172333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Family Member</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
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

        {/* Submit Button */}
        <View style={[styles.bottomContainer, {paddingBottom: insets.bottom + 16}]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.submitButton, addMutation.isPending && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={addMutation.isPending}>
            <Text style={styles.submitButtonText}>
              {addMutation.isPending ? 'Adding...' : 'Add Member'}
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
    backgroundColor: '#FFF',
  },

  keyboardContainer: {
    flex: 1,
  },

  // ================= HEADER =================
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172333',
  },

  placeholder: {
    width: 36,
  },

  // ================= SCROLL =================
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#172333',
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // ================= BOTTOM =================
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  submitButton: {
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
