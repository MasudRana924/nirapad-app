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
import {useTranslation} from 'react-i18next';

const TEAL = '#0E8B78';
const INK = '#172824';

const HomeFamilySection = ({navigation, members = []}) => {
  const {t} = useTranslation();
  const list = Array.isArray(members) ? members : [];

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('yourFamily')}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => navigation?.navigate('Family')}>
          <Icon name="chevron-forward" size={18} color="#8AA09B" />
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>{t('manageFamilyHint')}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {list.map(member => {
          const id = member.id || member.uuid;
          const photo = member.photo || member.profile_photo;
          const name = member.name || t('member');
          const meta = [member.relationship, member.age != null ? `${member.age} ${t('yrs')}` : null]
            .filter(Boolean)
            .join(' · ');
          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.88}
              style={styles.memberCard}
              onPress={() =>
                navigation?.navigate('FamilyMemberDetails', {memberId: id})
              }>
              {photo ? (
                <Image source={{uri: photo}} style={styles.avatar} />
              ) : (
                <View style={styles.memberIcon}>
                  <Icon name="person" size={18} color={TEAL} />
                </View>
              )}
              <View style={styles.copy}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {name}
                </Text>
                {meta ? (
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {meta}
                  </Text>
                ) : null}
              </View>
              <Icon name="chevron-forward" size={16} color="#9AABA6" />
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.addCard}
          onPress={() => navigation?.navigate('AddFamilyMember')}>
          <View style={styles.addIcon}>
            <Icon name="add" size={18} color={TEAL} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {t('homeAddMember')}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {t('includeALovedOne')}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default HomeFamilySection;

const CARD_WIDTH = 168;

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
  },
  hint: {
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
    fontSize: 13,
    lineHeight: 18,
    color: '#6E7E7A',
  },
  row: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 10,
  },
  memberCard: {
    width: CARD_WIDTH,
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
    shadowColor: '#17332E',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  addCard: {
    width: CARD_WIDTH,
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: '#B7D9D2',
    borderStyle: 'dashed',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.4,
    borderColor: '#9FCFC6',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    marginLeft: 8,
    marginRight: 4,
  },
  cardTitle: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '800',
    color: INK,
  },
  cardMeta: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    color: '#7A8C88',
    fontWeight: '500',
  },
});
