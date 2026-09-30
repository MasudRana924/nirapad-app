import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ImageBackground} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

const heroArt = require('../../assets/home-hero-scene.jpg');

const HomeHeroCard = ({navigation}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.wrap}>
      <ImageBackground
        source={heroArt}
        resizeMode="cover"
        imageStyle={styles.image}
        style={styles.card}>
        <View style={styles.trustPill}>
          <Icon name="shield-checkmark" size={13} color="#FFFFFF" />
          <Text style={styles.trustText}>{t('trustedCareAlways')}</Text>
        </View>

        <Text style={styles.title}>{t('lovedOnesDeserve')}</Text>
        <Text style={styles.subtitle}>{t('lovedOnesSubtitle')}</Text>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.cta}
          onPress={() =>
            navigation?.navigate('SelectFamilyMember', {serviceType: 'caregiver'})
          }>
          <Text style={styles.ctaText}>{t('bookACaregiver')}</Text>
          <View style={styles.ctaArrow}>
            <Icon name="arrow-forward" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.happierBadge}>
          <Text style={styles.happierText}>Better Care{'\n'}Happier Lives</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

export default HomeHeroCard;

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    marginHorizontal: 16,
    borderRadius: 26,
    shadowColor: '#0B6A5C',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  card: {
    minHeight: 214,
    borderRadius: 26,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    justifyContent: 'center',
    backgroundColor: '#0F9B86',
  },
  image: {
    borderRadius: 26,
  },
  trustPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  trustText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  title: {
    marginTop: 12,
    maxWidth: '62%',
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    maxWidth: '58%',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 6,
    height: 40,
    gap: 8,
  },
  ctaText: {
    color: '#123832',
    fontSize: 13.5,
    fontWeight: '800',
  },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0E8B78',
    alignItems: 'center',
    justifyContent: 'center',
  },
  happierBadge: {
    position: 'absolute',
    top: 14,
    right: 12,
    width: 78,
    transform: [{rotate: '-8deg'}],
  },
  happierText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 15,
    fontStyle: 'italic',
    fontWeight: '700',
    textAlign: 'right',
  },
});
