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
          {/* <Text style={styles.viewAllText}>{t('viewAll')}</Text> */}
          <Icon name="chevron-forward-sharp" size={15} color={TEAL} />
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
                  <Icon name="person" size={15} color={TEAL} />
                </View>
              )}
              <Text style={styles.memberName} numberOfLines={1}>
                {title}
              </Text>
              
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.addCard, {width: cardWidth}]}
          onPress={() => navigation?.navigate('AddFamilyMember')}>
          <View style={styles.addIcon}>
            <Icon name="add" size={16} color={TEAL} />
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
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEAL,
  },
  listContent: {
    gap: GAP,
  },
  memberCard: {
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: 6,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 4,
  },
  avatarFallback: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
  },
  memberMeta: {
    fontSize: 10,
    lineHeight: 12,
    color: MUTED,
    textAlign: 'center',
  },
  addCard: {
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#C9DCD8',
    borderStyle: 'dashed',
  },
  addIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34413F',
  },
});

