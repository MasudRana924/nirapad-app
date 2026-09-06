import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useFamilyMembers} from '../api/queries';
import Toast from '../components/common/Toast';
import FamilySkeleton from '../components/home/FamilySkeleton';
import Header from '../components/common/Header';

const FamilyScreen = ({navigation}) => {
  const [toast, setToast] = React.useState({visible: false, message: '', type: 'success'});

  // React Query hooks
  const {data: familyMembersData, isLoading} = useFamilyMembers();

  const familyMembers = familyMembersData?.data || [];

  const showToast = (message, type = 'success') => {
    setToast({visible: true, message, type});
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
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header
        title="Family"
        onBack={() => navigation?.goBack()}
        rightComponent={
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addButton}
            onPress={() => navigation?.navigate('AddFamilyMember', {redirectBack: 'FamilyScreen'})}>
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        }
      />

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
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    {member.photo ? (
                      <Image source={{uri: member.photo}} style={styles.avatar} />
                    ) : (
                      <View style={styles.placeholderAvatar}>
                        <Icon name="person" size={24} color="#8190A7" />
                      </View>
                    )}
                    {member.blood_group && (
                      <View style={styles.bloodBadge}>
                        <Text style={styles.bloodText}>{member.blood_group}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.name}>{member.name}</Text>
                    <View style={styles.infoRow}>
                      <Icon name="person-outline" size={15} color="#303944" />
                      <Text style={styles.infoText}>
                        {member.relationship} · {calculateAge(member.date_of_birth)} years
                      </Text>
                    </View>
                    {member.emergency_contact_phone && (
                      <View style={styles.infoRow}>
                        <Icon name="call-outline" size={14} color="#303944" />
                        <Text style={styles.infoText}>
                          Emergency: {member.emergency_contact_phone}
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    style={styles.editButtonTop}
                    onPress={() => navigation?.navigate('AddFamilyMember', {memberId: member.id})}>
                    <Text style={styles.editText}>Edit details</Text>
                    <Icon name="chevron-forward" size={17} color="#128D90" />
                  </TouchableOpacity>
                </View>

                {/* Care Note */}
                {member.medical_history && (
                  <View style={styles.careNote}>
                    <View style={styles.careHeader}>
                      <Icon name="ear-outline" size={19} color="#159B9A" />
                      <Text style={styles.careTitle}>Care Note</Text>
                    </View>
                    <Text style={styles.careDescription}>{member.medical_history}</Text>
                  </View>
                )}

              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

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
    backgroundColor: '#F8F9FC',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#008178',
  },

  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
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
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: '#E3E8F0',
    paddingBottom: 10,
    marginBottom: 12,
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

  // ================= CARD HEADER =================
  cardHeader: {
    width: '100%',
    height: 81,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatarContainer: {
    width: 58,
    height: 58,
    position: 'relative',
    marginRight: 13,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E5E5E5',
  },

  placeholderAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bloodBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    minWidth: 29,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#EAF3FF',
    borderWidth: 1,
    borderColor: '#D8E7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bloodText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    color: '#43658B',
  },

  userInfo: {
    flex: 1,
    paddingTop: 1,
  },

  name: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 3,
  },

  infoRow: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    marginLeft: 5,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
    color: '#303944',
  },

  // ================= CARE NOTE =================
  careNote: {
    width: '100%',
    height: 82,
    backgroundColor: '#E3EDFF',
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingTop: 9,
    marginTop: 10,
  },

  careHeader: {
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },

  careTitle: {
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: '#168C91',
  },

  careDescription: {
    marginLeft: 23,
    marginTop: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#344052',
  },

  editButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 0,
  },

  editText: {
    marginRight: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#128D90',
  },
});
