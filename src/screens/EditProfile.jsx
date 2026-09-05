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
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {useUserProfile} from '../api/queries';
import {useUpdateProfile} from '../api/mutations';
import {launchImageLibrary, requestMediaLibraryPermissions} from 'react-native-image-picker';
import Toast from '../components/common/Toast';

const EditProfile = ({navigation}) => {
  const {data: profileData} = useUserProfile();
  const updateMutation = useUpdateProfile();
  
  const [toast, setToast] = useState({visible: false, message: '', type: 'success'});
  const [imageUri, setImageUri] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
  });

  const user = profileData?.data || {};

  // Populate form when user data loads
  React.useEffect(() => {
    if (user.name) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: '',
        date_of_birth: '',
      });
      if (user.profile_photo) {
        setImageUri(user.profile_photo);
      }
    }
  }, [user]);

  const handleImagePick = async () => {
    try {
      const permissionResult = await requestMediaLibraryPermissions({
        mediaType: 'photo',
      });

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library.');
        return;
      }

      const options = {
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
        selectionLimit: 1,
      };

      const result = await launchImageLibrary(options);
      if (result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  const handleSaveProfile = async () => {
    const {name, email, phone, address, date_of_birth} = formData;

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter email');
      return;
    }

    try {
      const data = new FormData();
      data.append('name', name);
      data.append('email', email);
      if (phone) data.append('phone', phone);
      if (address) data.append('address', address);
      if (date_of_birth) data.append('date_of_birth', date_of_birth);
      
      if (imageUri) {
        data.append('profile_photo', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile_photo.jpg',
        });
      }

      await updateMutation.mutateAsync(data);
      showToast('Profile updated successfully');
      navigation?.goBack();
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({visible: true, message, type});
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
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
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={text => setFormData({...formData, email: text})}
                placeholder="Enter email"
                placeholderTextColor="#8190A7"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
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
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={text => setFormData({...formData, address: text})}
                placeholder="Enter address"
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
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.submitButton, updateMutation.isPending && styles.disabledButton]}
            onPress={handleSaveProfile}
            disabled={updateMutation.isPending}>
            <Text style={styles.submitButtonText}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
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

export default EditProfile;
