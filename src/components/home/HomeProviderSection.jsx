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

const HomeProviderSection = ({title, items = [], onViewAll, onItemPress}) => {
  const {t} = useTranslation();

  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onViewAll}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.viewAll}>{t('viewAll')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {items.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            style={styles.card}
            onPress={() => onItemPress?.(item.raw)}>
            {item.photo ? (
              <Image source={{uri: item.photo}} style={styles.avatar} />
            ) : (
              <View style={styles.avatarIcon}>
                <Icon name="person" size={18} color={TEAL} />
              </View>
            )}
            <View style={styles.copy}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.metaRow}>
                <Icon name="star" size={11} color="#F6A900" />
                <Text style={styles.meta} numberOfLines={1}>
                  {item.meta}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default HomeProviderSection;

const CARD_WIDTH = 168;

const styles = StyleSheet.create({
  section: {
    marginTop: 6,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: TEAL,
  },
  row: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 10,
    marginTop: 10,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E6ECEB',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EEEC',
  },
  avatarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    marginLeft: 8,
  },
  name: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    color: INK,
  },
  metaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  meta: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    color: '#7A8C88',
    fontWeight: '500',
  },
});
