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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const FamilyScreen = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: '',
    age: '',
  });

  const familyMembers = [
    {
      id: 1,
      name: 'Abul Hossain',
      relation: 'Father',
      age: '72',
      service: 'At Square Hospital',
      image: 'https://randomuser.me/api/portraits/men/75.jpg',
      online: true,
    },
    {
      id: 2,
      name: 'Farida Begum',
      relation: 'Mother',
      age: '68',
      service: 'At Home',
      image: 'https://randomuser.me/api/portraits/women/65.jpg',
      online: false,
    },
  ];

  const handleAddMember = () => {
    // TODO: Add logic to save new family member
    console.log('Adding member:', newMember);
    setModalVisible(false);
    setNewMember({name: '', relation: '', age: ''});
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
          <Icon name="add" size={24} color="#2478D4" />
        </TouchableOpacity>
      </View>

      {/* ================= FAMILY LIST ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.familyGrid}>
          {familyMembers.map(member => (
            <TouchableOpacity
              key={member.id}
              activeOpacity={0.85}
              style={styles.familyCard}>
              <View style={styles.cardLeft}>
                <View style={styles.familyImageWrapper}>
                  <Image source={{uri: member.image}} style={styles.familyImage} />
                  {member.online && <View style={styles.onlineDot} />}
                </View>
              </View>

              <View style={styles.cardRight}>
                <View style={styles.cardHeader}>
                  <Text style={styles.familyName}>{member.name}</Text>
                  {member.online && (
                    <View style={styles.onlineBadge}>
                      <Text style={styles.onlineBadgeText}>Online</Text>
                    </View>
                  )}
                </View>

                <View style={styles.infoRow}>
                  <Icon name="person-outline" size={14} color="#8190A7" />
                  <Text style={styles.familyRelation}>{member.relation}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="calendar-outline" size={14} color="#8190A7" />
                  <Text style={styles.familyAge}>{member.age} years old</Text>
                </View>

                <View style={styles.statusContainer}>
                  <Icon name="location-outline" size={14} color="#1473DC" />
                  <Text style={styles.familyStatusText}>{member.service}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name</Text>
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
                  <Text style={styles.label}>Relation</Text>
                  <TextInput
                    style={styles.input}
                    value={newMember.relation}
                    onChangeText={text =>
                      setNewMember({...newMember, relation: text})
                    }
                    placeholder="e.g., Father, Mother"
                    placeholderTextColor="#8190A7"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={newMember.age}
                    onChangeText={text =>
                      setNewMember({...newMember, age: text})
                    }
                    placeholder="Enter age"
                    placeholderTextColor="#8190A7"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Add Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addMemberButton}
                onPress={handleAddMember}>
                <Text style={styles.addMemberButtonText}>Add Member</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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

  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#19B57A',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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

  // ================= ADD BUTTON =================
  addMemberButton: {
    height: 53,
    backgroundColor: '#2478D4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addMemberButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
