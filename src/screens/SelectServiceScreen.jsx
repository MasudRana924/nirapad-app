import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {CARE_SERVICES} from '../data/careServices';
import {storage} from '../utils/storage';
import PrimaryButton from '../components/common/PrimaryButton';
import {useTranslation} from 'react-i18next';

const PAGE = '#FFFFFF';
const TEAL = '#008178';
const INK = '#163532';
const MUTED = '#6F8480';

const SelectServiceScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {selectedMember, serviceType} = route.params || {};
  const preselected =
    CARE_SERVICES.find(s => s.id === serviceType || s.category === serviceType) ||
    null;
  const [selectedService, setSelectedService] = useState(preselected);

  const handleNext = async () => {
    if (!selectedService) {
      return;
    }
    await storage.saveSelectedService(selectedService);
    navigation?.navigate('AreaSelect', {
      selectedMember,
      selectedService,
      serviceType: selectedService.category || selectedService.id,
    });
  };

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE} />
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation?.goBack()}>
            <Icon name="arrow-back" size={22} color={INK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t('selectServiceTitle', 'Select a care service')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            {t('selectServiceDesc', 'Choose the type of care your family member needs. Prices shown are starting rates.')}
          </Text>

          {CARE_SERVICES.map(service => {
            const selected = selectedService?.id === service.id;
            return (
              <TouchableOpacity
                key={service.id}
                activeOpacity={0.9}
                style={[styles.card, selected && styles.cardSelected]}
                onPress={() => setSelectedService(service)}>
                {service.image ? (
                  <Image
                    source={service.image}
                    style={styles.illustration}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.illustrationFallback}>
                    <Icon name={service.icon} size={28} color={TEAL} />
                  </View>
                )}

                <View style={styles.cardBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {service.title}
                    </Text>
                    {selected ? (
                      <View style={styles.checkWrap}>
                        <Icon name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={styles.radio} />
                    )}
                  </View>

                  {/* <Text style={styles.description} numberOfLines={3}>
                    {service.description}
                  </Text> */}

                  <View style={styles.metaRow}>
                    {service.badge ? (
                      <View style={styles.badge}>
                        <Icon name="shield-checkmark" size={12} color={TEAL} />
                        <Text style={styles.badgeText}>{service.badge}</Text>
                      </View>
                    ) : (
                      <View />
                    )}
                    <View style={styles.priceBlock}>
                      <Text style={styles.priceFrom}>{t('from', 'From')}</Text>
                      <Text style={styles.price}>
                        ৳{service.price.toLocaleString('en-BD')}/{service.priceUnit}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View
          style={[
            styles.bottomContainer,
            {paddingBottom: Math.max(16, insets.bottom + 8)},
          ]}>
          <PrimaryButton
            title={t('next', 'Next')}
            onPress={handleNext}
            disabled={!selectedService}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SelectServiceScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: PAGE,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    minHeight: 44,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: INK,
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 21,
    color: MUTED,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E6EEEC',

  },
  cardSelected: {
    borderColor: TEAL,
    backgroundColor: '#FFFFFF',
  },
  illustration: {
    width: 86,
    height: 86,
    borderRadius: 16,
    backgroundColor: '#F3FAF7',
  },
  illustrationFallback: {
    width: 86,
    height: 86,
    borderRadius: 16,
    backgroundColor: '#F3FAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C5D4D0',
    backgroundColor: '#FFFFFF',
  },
  checkWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: MUTED,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F6F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAL,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceFrom: {
    fontSize: 11,
    color: MUTED,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  bottomContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: PAGE,
  },
});
