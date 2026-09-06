import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useFamilyMembers} from '../api/queries';
import Header from '../components/common/Header';

const SelectFamilyMember = ({navigation, route}) => {
  const [selectedMember, setSelectedMember] = useState(route.params?.selectedMember);
  const {selectedCaregiver} = route.params || {};
  const {data: familyMembersData, isLoading} = useFamilyMembers();
  const familyMembers = familyMembersData?.data || [];

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleNext = () => {
    if (selectedMember) {
      if (selectedCaregiver) {
        // Skip caregiver selection, go directly to hospital selection
        navigation?.navigate('HospitalSelection', {
          selectedMember,
          selectedCaregiver,
        });
      } else {
        // Normal flow: go to caregiver selection
        navigation?.navigate('SelectCaregiver', {
          selectedMember,
        });
      }
    }
  };

  const handleAddMember = () => {
    navigation?.navigate('AddFamilyMember', {
      redirectBack: 'SelectFamilyMember',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Select Family Member" onBack={() => navigation?.goBack()} />

      {/* ================= FAMILY LIST ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
          <View>
            <Text style={styles.sectionTitle}>Who needs assistance?</Text>
          </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : familyMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={64} color="#E3E8F0" />
            <Text style={styles.emptyTitle}>No Family Members</Text>
            <Text style={styles.emptyText}>
              Add your family members to get started
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addButton}
              onPress={handleAddMember}>
              <Icon name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Family Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.familyGrid}>
            {familyMembers.map(member => (
              <TouchableOpacity
                key={member.id}
                activeOpacity={0.85}
                style={[
                  styles.familyCard,
                  selectedMember?.id === member.id && styles.selectedCard,
                ]}
                onPress={() => setSelectedMember(member)}>
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

                {/* Footer */}
                <View style={styles.footer}>
                  <View style={styles.footerLeft}>
                    <Icon name="medkit-outline" size={16} color="#36404C" />
                    <Text style={styles.footerText}>
                      ID: {member.id}
                    </Text>
                  </View>
                </View>

                {selectedMember?.id === member.id && (
                  <View style={styles.selectedOverlay}>
                    <Icon name="checkmark-circle" size={32} color="#008178" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ================= NEXT BUTTON ================= */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.nextButton,
            !selectedMember && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!selectedMember}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Icon name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SelectFamilyMember;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ================= SCROLL =================
  scrollView: {
    flex: 1,
  },

  sectionTitle:{
    fontSize: 12,
    fontWeight: '500',
    color: '#172333',
    marginBottom: 15,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // ================= LOADING =================
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  loadingText: {
    fontSize: 16,
    color: '#8190A7',
  },

  // ================= EMPTY STATE =================
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
    marginBottom: 24,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#008178',
  },

  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },

  // ================= FAMILY GRID =================
  familyGrid: {
    flexDirection: 'column',
  },

  familyCard: {
    width: '100%',
    height: 234,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: '#E3E8F0',
    paddingBottom: 10,
    marginBottom: 12,
    position: 'relative',
  },

  selectedCard: {
    borderColor: '#008178',
    borderWidth: 2,
  },

  selectedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },

  // ================= CARD HEADER =================
  cardHeader: {
    width: '100%',
    height: 81,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  placeholderAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
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

  // ================= FOOTER =================
  footer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 1,
  },

  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 1,
  },

  footerText: {
    marginLeft: 5,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: '#36404C',
  },

  editButton: {
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

  // ================= BOTTOM =================
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },

  nextButton: {
    backgroundColor: '#008178',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  disabledButton: {
    backgroundColor: '#B5C0D0',
  },

  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
