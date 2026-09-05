import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const SelectFamilyMember = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const [selectedMember, setSelectedMember] = useState(route.params?.selectedMember);
  const {selectedCaregiver} = route.params || {};

  const familyMembers = [
    {
      id: 1,
      name: 'Abdul Khaleque',
      relation: 'Father',
      age: '68',
      bloodGroup: 'O+',
      emergencyContact: 'Masud (Son)',
      careNote: 'Hearing assistance; takes blood pressure\nmedicine at 11:00 AM.',
      idNumber: 'HH-7310',
      checkupDue: true,
      image: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    {
      id: 2,
      name: 'Farida Begum',
      relation: 'Mother',
      age: '68',
      bloodGroup: 'A+',
      emergencyContact: 'Rahim (Son)',
      careNote: 'Diabetes management; insulin at 8:00 AM\nand 8:00 PM daily.',
      idNumber: 'HH-7311',
      checkupDue: false,
      image: 'https://randomuser.me/api/portraits/women/65.jpg',
    },
  ];

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

        <Text style={styles.headerTitle}>Select Family Member</Text>

        <View style={styles.placeholder} />
      </View>

      {/* ================= FAMILY LIST ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
          <View>
            <Text style={styles.sectionTitle}>Who needs assistance?</Text>
          </View>
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
              <View style={styles.header}>
                <View style={styles.avatarContainer}>
                  <Image source={{uri: member.image}} style={styles.avatar} />
                  <View style={styles.bloodBadge}>
                    <Text style={styles.bloodText}>{member.bloodGroup}</Text>
                  </View>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.name}>{member.name}</Text>
                  <View style={styles.infoRow}>
                    <Icon name="person-outline" size={15} color="#303944" />
                    <Text style={styles.infoText}>
                      {member.relation} · {member.age} years
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="call-outline" size={14} color="#303944" />
                    <Text style={styles.infoText}>
                      Emergency Contact: {member.emergencyContact}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Care Note */}
              <View style={styles.careNote}>
                <View style={styles.careHeader}>
                  <Icon name="ear-outline" size={19} color="#159B9A" />
                  <Text style={styles.careTitle}>Care Note</Text>
                </View>
                <Text style={styles.careDescription}>{member.careNote}</Text>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.footerLeft}>
                  <Icon name="medkit-outline" size={16} color="#36404C" />
                  <Text style={styles.footerText}>
                    ID: {member.idNumber} · {member.checkupDue ? 'Checkup due' : 'Checkup OK'}
                  </Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} style={styles.editButton}>
                  <Text style={styles.editText}>Edit details</Text>
                  <Icon name="chevron-forward" size={17} color="#128D90" />
                </TouchableOpacity>
              </View>

              {selectedMember?.id === member.id && (
                <View style={styles.selectedOverlay}>
                  <Icon name="checkmark-circle" size={32} color="#008178" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
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

  // ================= HEADER =================
  header: {
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
