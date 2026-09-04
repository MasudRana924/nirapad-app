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
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="person" size={24} color="#2478D4" />
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <View style={styles.nameRow}>
                    <Text style={styles.familyName}>{member.name}</Text>
                    {member.online && (
                      <View style={styles.onlineBadge}>
                        <Text style={styles.onlineBadgeText}>Online</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.relationText}>
                    {member.relation} · {member.age} years
                  </Text>
                </View>

                {selectedMember?.id === member.id && (
                  <View style={styles.checkSection}>
                    <Icon name="checkmark-circle" size={24} color="#2478D4" />
                  </View>
                )}
              </View>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },

  selectedCard: {
    borderColor: '#2478D4',
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  cardLeft: {
    marginRight: 12,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardRight: {
    flex: 1,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  familyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#172333',
    marginRight: 8,
  },

  onlineBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#19B57A',
  },

  relationText: {
    fontSize: 13,
    color: '#8190A7',
  },

  checkSection: {
    marginLeft: 12,
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
    backgroundColor: '#2478D4',
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
