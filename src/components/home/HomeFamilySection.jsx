import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../common/PrimaryButton';

const TEAL = '#008178';
const INK = '#0B3F3C';
const MUTED = '#6F8480';

/**
 * Home "Your family" section — empty state matches mock; list when members exist.
 */
const HomeFamilySection = ({navigation, members = []}) => {
  const hasMembers = Array.isArray(members) && members.length > 0;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your family</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => navigation?.navigate('Main', {screen: 'Family'})}
          style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View all</Text>
          <Icon name="chevron-forward" size={14} color={TEAL} />
        </TouchableOpacity>
      </View>

      {hasMembers ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}>
          {members.slice(0, 8).map(member => {
            const photo = member.photo || member.profile_photo;
            return (
              <TouchableOpacity
                key={member.id || member.uuid}
                activeOpacity={0.85}
                style={styles.memberCard}
                onPress={() =>
                  navigation?.navigate('FamilyMemberDetails', {
                    memberId: member.id || member.uuid,
                  })
                }>
                {photo ? (
                  <Image source={{uri: photo}} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Icon name="person" size={22} color={TEAL} />
                  </View>
                )}
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.name || 'Member'}
                </Text>
                <Text style={styles.memberMeta} numberOfLines={1}>
                  {member.relationship || 'Family'}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.addMini}
            onPress={() => navigation?.navigate('AddFamilyMember')}>
            <Icon name="add" size={22} color={TEAL} />
            <Text style={styles.addMiniText}>Add</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Icon name="home-outline" size={36} color={TEAL} />
            <View style={styles.heartOverlay}>
              <Icon name="heart" size={12} color={TEAL} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>No family members yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your family members to book care for your loved ones.
          </Text>
          <PrimaryButton
            title="+ Add family member"
            variant="secondary"
            onPress={() => navigation?.navigate('AddFamilyMember')}
            style={styles.addButton}
            textStyle={styles.addButtonText}
          />
        </View>
      )}
    </View>
  );
};

export default HomeFamilySection;

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAL,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heartOverlay: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: INK,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  addButton: {
    height: 48,
    borderRadius: 14,
    maxWidth: 260,
    alignSelf: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingRight: 8,
    gap: 12,
  },
  memberCard: {
    width: 96,
    alignItems: 'center',
    backgroundColor: '#F6F8F7',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
  },
  memberMeta: {
    marginTop: 2,
    fontSize: 11,
    color: MUTED,
    textAlign: 'center',
  },
  addMini: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C9E4E0',
    borderStyle: 'dashed',
    paddingVertical: 18,
  },
  addMiniText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: TEAL,
  },
});
