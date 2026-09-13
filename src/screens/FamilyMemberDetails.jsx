import React from 'react';
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
import Header from '../components/common/Header';
import {useFamilyMember} from '../api/queries';
import FamilyDetailsSkeleton from '../components/home/FamilyDetailsSkeleton';

const DetailRow = ({label, value, icon}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailRowLeft}>
      <View style={styles.detailIcon}>
        <Icon name={icon} size={18} color="#008178" />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={styles.detailValue}>{value || '—'}</Text>
  </View>
);

const FamilyMemberDetails = ({navigation, route}) => {
  const {memberId} = route.params || {};
  const {data: memberData, isLoading} = useFamilyMember(memberId);
  const member = memberData?.data;

  const handleEdit = () => {
    navigation?.navigate('AddFamilyMember', {
      memberId: member.id,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <Header title="Member Details" onBack={() => navigation?.goBack()} />
        <FamilyDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (!member) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <Header title="Member Details" onBack={() => navigation?.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Member not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header
        title="Member Details"
        onBack={() => navigation?.goBack()}
        rightComponent={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleEdit}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {member.photo ? (
            <Image source={{uri: member.photo}} style={styles.profilePhoto} />
          ) : (
            <View style={styles.profilePhotoEmpty}>
              <Icon name="person" size={40} color="#8190A7" />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{member.name}</Text>
            <Text style={styles.profileRelation}>{member.relationship}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <DetailRow
            label="Gender"
            value={
              member.gender
                ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1)
                : '—'
            }
            icon="male-female-outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FamilyMemberDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8190A7',
  },
  editButton: {
    fontSize: 15,
    fontWeight: '600',
    color: '#008178',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  profilePhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profilePhotoEmpty: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 4,
  },
  profileRelation: {
    fontSize: 15,
    color: '#8190A7',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  detailRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8190A7',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111820',
    textAlign: 'right',
    flex: 1,
  },
});
