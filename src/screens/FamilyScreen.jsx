import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useFamilyMembers} from '../api/queries';
import {useAddFamilyMember} from '../api/mutations';
import Toast from '../components/common/Toast';
import FamilySkeleton from '../components/home/FamilySkeleton';

const FamilyScreen = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [toast, setToast] = useState({visible: false, message: '', type: 'success'});
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    phone: '',
    blood_group: '',
    date_of_birth: '',
    description: '',
  });

  // React Query hooks
  const {data: familyMembersData, isLoading, refetch} = useFamilyMembers();
  const addMutation = useAddFamilyMember();

  const familyMembers = familyMembersData?.data || [];

  const showToast = (message, type = 'success') => {
    setToast({visible: true, message, type});
  };

  const handleAddMember = async () => {
    const {name, relationship, phone, blood_group, date_of_birth, description} = newMember;

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
      const formData = new FormData();
      formData.append('name', name);
      formData.append('relationship', relationship);
      formData.append('phone', phone);
      if (blood_group) formData.append('blood_group', blood_group);
      if (date_of_birth) formData.append('date_of_birth', date_of_birth);
      if (description) formData.append('description', description);

      await addMutation.mutateAsync(formData);
      showToast('Family member added successfully');
      setModalVisible(false);
      setNewMember({
        name: '',
        relationship: '',
        phone: '',
        blood_group: '',
        date_of_birth: '',
        description: '',
      });
    } catch (error) {
      console.error('Failed to add family member:', error);
      showToast('Failed to add family member', 'error');
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation?.goBack()}>
          <Icon name="arrow-back" size={24} color="#172333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Family</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.addButton}
          onPress={() => setModalVisible(true)}>
          <Icon name="add" size={24} color="#008178" />
        </TouchableOpacity>
      </View>

      {/* ================= FAMILY LIST ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <FamilySkeleton />
        ) : familyMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={64} color="#E3E8F0" />
            <Text style={styles.emptyTitle}>No Family Members</Text>
            <Text style={styles.emptyText}>
              Add your family members to get started
            </Text>
          </View>
        ) : (
          <View style={styles.familyGrid}>
            {familyMembers.map(member => (
              <TouchableOpacity
                key={member.id}
                activeOpacity={0.85}
                style={styles.familyCard}>
                <View style={styles.cardLeft}>
                  <View style={styles.familyImageWrapper}>
                    {member.photo ? (
                      <Image source={{uri: member.photo}} style={styles.familyImage} />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Icon name="person" size={32} color="#8190A7" />
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <Text style={styles.familyName}>{member.name}</Text>

                  <View style={styles.infoRow}>
                    <Icon name="person-outline" size={14} color="#8190A7" />
                    <Text style={styles.familyRelation}>{member.relationship}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Icon name="calendar-outline" size={14} color="#8190A7" />
                    <Text style={styles.familyAge}>{calculateAge(member.date_of_birth)} years old</Text>
                  </View>

                  {member.blood_group && (
                    <View style={styles.infoRow}>
                      <Icon name="medkit-outline" size={14} color="#8190A7" />
                      <Text style={styles.familyRelation}>Blood: {member.blood_group}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ================= ADD FAMILY MODAL (BOTTOM SHEET) ================= */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'undefined'}
            style={styles.keyboardContainer}>
            <View style={styles.bottomSheet}>
              {/* Handle bar */}
              <View style={styles.handleBar} />

              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Family Member</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#172333" />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <ScrollView style={styles.formScroll}>
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={newMember.name}
                      onChangeText={text =>
                        setNewMember({...newMember, name: text})
                      }
                      placeholder="Enter name"
                      placeholderTextColor="#8190A7"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Relationship *</Text>
                    <TextInput
                      style={styles.input}
                      value={newMember.relationship}
                      onChangeText={text =>
                        setNewMember({...newMember, relationship: text})
                      }
                      placeholder="e.g., Father, Mother, Spouse"
                      placeholderTextColor="#8190A7"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone *</Text>
                    <TextInput
                      style={styles.input}
                      value={newMember.phone}
                      onChangeText={text =>
                        setNewMember({...newMember, phone: text})
                      }
                      placeholder="Enter phone number"
                      placeholderTextColor="#8190A7"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Blood Group</Text>
                    <TextInput
                      style={styles.input}
                      value={newMember.blood_group}
                      onChangeText={text =>
                        setNewMember({...newMember, blood_group: text})
                      }
                      placeholder="e.g., O+, A+, B+"
                      placeholderTextColor="#8190A7"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TextInput
                      style={styles.input}
                      value={newMember.date_of_birth}
                      onChangeText={text =>
                        setNewMember({...newMember, date_of_birth: text})
                      }
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#8190A7"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={newMember.description}
                      onChangeText={text =>
                        setNewMember({...newMember, description: text})
                      }
                      placeholder="Medical notes or other information"
                      placeholderTextColor="#8190A7"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Add Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.addMemberButton, isAdding && styles.disabledButton]}
                onPress={handleAddMember}
                disabled={isAdding}>
                <Text style={styles.addMemberButtonText}>
                  {isAdding ? 'Adding...' : 'Add Member'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

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

export default FamilyScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
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

  addButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ================= SCROLL =================
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
  },

  // ================= FAMILY GRID =================
  familyGrid: {
    flexDirection: 'column',
  },

  familyCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,

  },

  cardLeft: {
    marginRight: 16,
  },

  cardRight: {
    flex: 1,
  },

  familyImageWrapper: {
    position: 'relative',
  },

  familyImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  placeholderImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#172333',
    marginTop: 16,
  },

  emptyText: {
    fontSize: 14,
    color: '#8190A7',
    marginTop: 8,
  },

  familyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172333',
  },

  onlineBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  onlineBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#19B57A',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  familyRelation: {
    fontSize: 14,
    color: '#8190A7',
    marginLeft: 6,
  },

  familyAge: {
    fontSize: 14,
    color: '#8190A7',
    marginLeft: 6,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  familyStatusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1473DC',
    marginLeft: 6,
  },

  // ================= MODAL =================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E3E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172333',
  },

  // ================= FORM =================
  formScroll: {
    maxHeight: 400,
  },

  formContainer: {
    marginBottom: 24,
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
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // ================= ADD BUTTON =================
  addMemberButton: {
    height: 53,
    backgroundColor: '#008178',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    backgroundColor: '#B5C0D0',
  },

  addMemberButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
