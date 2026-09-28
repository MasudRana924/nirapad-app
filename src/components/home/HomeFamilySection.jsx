import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

const TEAL = '#0B7A6E';
const INK = '#0F1A19';
const MUTED = '#7A8886';
const SCREEN_PADDING = 20;
const GAP = 10;

const HomeFamilySection = ({navigation, members = []}) => {
  const {t} = useTranslation();
  const {width} = useWindowDimensions();
  const list = Array.isArray(members) ? members : [];
  const cardWidth = (width - SCREEN_PADDING * 2 - GAP * 2) / 3;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('yourFamily')}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => navigation?.navigate('Main', {screen: 'Family'})}
          style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>{t('viewAll')}</Text>
          <Icon name="arrow-forward" size={14} color={TEAL} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        {list.slice(0, 8).map(member => {
          const photo = member.photo || member.profile_photo;
          const title = member.relationship || member.name || t('member');
          const meta =
            member.age != null
              ? String(member.age)
              : member.relationship
                ? member.name
                : '';
          return (
            <TouchableOpacity
              key={member.id || member.uuid}
              activeOpacity={0.85}
              style={[styles.memberCard, {width: cardWidth}]}
              onPress={() =>
                navigation?.navigate('FamilyMemberDetails', {
                  memberId: member.id || member.uuid,
                })
              }>
              {photo ? (
                <Image source={{uri: photo}} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Icon name="person" size={20} color={TEAL} />
                </View>
              )}
              <Text style={styles.memberName} numberOfLines={1}>
                {title}
              </Text>
              {meta ? (
                <Text style={styles.memberMeta} numberOfLines={1}>
                  {meta}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.addCard, {width: cardWidth}]}
          onPress={() => navigation?.navigate('AddFamilyMember')}>
          <View style={styles.addIcon}>
            <Icon name="add" size={20} color={TEAL} />
          </View>
          <Text style={styles.addText} numberOfLines={1}>
            {t('addMember')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default HomeFamilySection;

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEAL,
  },
  listContent: {
    gap: GAP,
  },
  memberCard: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3ECEA',
    paddingHorizontal: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 6,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
  },
  memberMeta: {
    marginTop: 1,
    fontSize: 11,
    color: MUTED,
    textAlign: 'center',
  },
  addCard: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#C9DCD8',
    borderStyle: 'dashed',
  },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34413F',
  },
});
