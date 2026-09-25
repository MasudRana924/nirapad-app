import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSearchCaregivers} from '../api/queries';
import CaregiverSkeleton from '../components/home/CaregiverSkeleton';
import PrimaryButton from '../components/common/PrimaryButton';
import {storage} from '../utils/storage';
import {useTranslation} from 'react-i18next';

const TEAL = '#008178';
const INK = '#163532';
const MUTED = '#7B9390';

const SKILL_ICONS = {
  'personal care': 'people-outline',
  medication: 'medkit-outline',
  'elderly support': 'heart-outline',
  'hospital visit': 'business-outline',
  companion: 'heart-outline',
};

const getCaregiverSkills = caregiver => {
  const raw =
    caregiver?.skills ||
    caregiver?.specialties ||
    caregiver?.tags ||
    caregiver?.services ||
    [];
  if (Array.isArray(raw)) {
    return raw
      .map(item => (typeof item === 'string' ? item : item?.name || item?.title))
      .filter(Boolean)
      .slice(0, 3);
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return [];
};

const formatRate = rate => {
  const numeric = Number(rate);
  if (Number.isNaN(numeric)) {
    return String(rate);
  }
  return numeric.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const SelectCaregiverScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const {
    selectedMember,
    selectedService,
    district = '',
    thana = '',
    selectedArea,
    serviceType = 'caregiver',
  } = route.params || {};

  const selectedDistrict = district || selectedArea?.district || '';
  const selectedThana = thana || selectedArea?.thana || '';

  const filters = [
    {id: 'all', label: t('all', 'All')},
    {id: 'male', label: t('male', 'Male')},
    {id: 'female', label: t('female', 'Female')},
  ];

  const {data: caregiversData, isLoading} = useSearchCaregivers({
    name: search,
    district: selectedDistrict,
    thana: selectedThana,
    gender: selectedFilter === 'all' ? '' : selectedFilter,
  });

  const caregivers = Array.isArray(caregiversData?.data)
    ? caregiversData.data
    : [];

  const handleFilterSelect = filterId => {
    setSelectedFilter(filterId === selectedFilter ? '' : filterId);
  };

  const handleSearch = text => {
    setSearch(text);
  };

  const handleNext = () => {
    if (selectedCaregiver) {
      storage.saveSelectedCaregiver(selectedCaregiver);
      navigation?.navigate('HospitalSelection', {
        selectedMember,
        selectedCaregiver,
        selectedService,
        selectedArea: selectedArea || {
          district: selectedDistrict,
          thana: selectedThana,
        },
        serviceType,
      });
    }
  };

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation?.goBack()}>
            <Icon name="arrow-back" size={22} color={INK} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('selectCaregiver', 'Select Caregiver')}</Text>

          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.searchBox}>
            <Icon name="search-outline" size={18} color={MUTED} />
            <TextInput
              value={search}
              onChangeText={handleSearch}
              placeholder={t('searchByName', 'Search by name')}
              placeholderTextColor={MUTED}
              style={styles.searchInput}
            />
          </View>

          {(!!selectedDistrict || !!selectedThana) && (
            <View style={styles.areaBanner}>
              <Icon name="location" size={16} color={TEAL} />
              <Text style={styles.areaBannerText} numberOfLines={1}>
                {[selectedThana, selectedDistrict].filter(Boolean).join(', ')}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation?.goBack()}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                style={styles.changeRow}>
                <Text style={styles.changeAreaText}>{t('change', 'Change')}</Text>
                <Icon name="chevron-forward" size={14} color={TEAL} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.filterRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}>
              {filters.map(filter => {
                const selected = selectedFilter === filter.id;
                return (
                  <TouchableOpacity
                    key={filter.id}
                    activeOpacity={0.8}
                    onPress={() => handleFilterSelect(filter.id)}
                    style={[
                      styles.filterChip,
                      selected && styles.filterChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.filterText,
                        selected && styles.filterTextActive,
                      ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity activeOpacity={0.7} style={styles.sortButton}>
              <Icon name="swap-vertical" size={16} color={TEAL} />
              <Text style={styles.sortText}>{t('sort', 'Sort')}</Text>
              <Icon name="chevron-down" size={14} color={TEAL} />
            </TouchableOpacity>
          </View>

          <Text style={styles.resultCount}>
            {caregivers.length} {t('caregiverProfile', 'caregiver')}
            {caregivers.length === 1 ? '' : 's'} {t('available', 'available')}
          </Text>

          {isLoading ? (
            <CaregiverSkeleton />
          ) : caregivers.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Icon name="people-outline" size={32} color={TEAL} />
              </View>
              <Text style={styles.emptyTitle}>{t('noCaregiversFound', 'No caregiver found')}</Text>
              <Text style={styles.emptyText}>
                No caregivers are available in{' '}
                {[selectedThana, selectedDistrict].filter(Boolean).join(', ') ||
                  'this area'}
                . Try another district or thana.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.changeAreaButton}
                onPress={() => navigation?.goBack()}>
                <Text style={styles.changeAreaButtonText}>{t('changeArea', 'Change area')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.caregiverList}>
              {caregivers.map(caregiver => {
                const isSelected = selectedCaregiver?.id === caregiver.id;
                const rate = caregiver.hourly_rate ?? caregiver.price;
                const skills = getCaregiverSkills(caregiver);
                const fallbackSkill = selectedService?.title;

                return (
                  <TouchableOpacity
                    key={caregiver.id}
                    activeOpacity={0.85}
                    style={[
                      styles.caregiverCard,
                      isSelected && styles.selectedCard,
                    ]}
                    onPress={() => setSelectedCaregiver(caregiver)}>
                    <View style={styles.cardHeader}>
                      <View style={styles.avatarContainer}>
                        {caregiver.profile_photo ? (
                          <Image
                            source={{uri: caregiver.profile_photo}}
                            style={styles.avatar}
                          />
                        ) : (
                          <View style={styles.placeholderAvatar}>
                            <Icon name="person" size={28} color={MUTED} />
                          </View>
                        )}
                        {caregiver.is_available ? (
                          <View style={styles.onlineDot} />
                        ) : null}
                      </View>

                      <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name} numberOfLines={1}>
                            {caregiver.name || t('caregiverProfile', 'Caregiver')}
                          </Text>
                          {caregiver.is_available ? (
                            <View style={styles.availableBadge}>
                              <View style={styles.availableDot} />
                              <Text style={styles.availableBadgeText}>
                                {t('available', 'Available')}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <View style={styles.infoRow}>
                          <Icon name="star" size={14} color="#F6A900" />
                          <Text style={styles.infoText}>
                            {caregiver.rating ?? '0.00'}
                            {caregiver.completed_bookings != null
                              ? ` (${caregiver.completed_bookings})`
                              : ' (0)'}
                            {'  ·  '}
                            {caregiver.experience_years ?? 0} {t('experience', 'yrs exp')}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Icon name="location-outline" size={14} color={MUTED} />
                          <Text style={styles.infoText} numberOfLines={1}>
                            {[caregiver.thana, caregiver.district]
                              .filter(Boolean)
                              .join(', ') ||
                              caregiver.service_areas?.join(', ') ||
                              t('noLocation', 'No location')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {(skills.length > 0 || fallbackSkill) && (
                      <View style={styles.tagsRow}>
                        {(skills.length > 0 ? skills : [fallbackSkill]).map(
                          tag => (
                            <View key={tag} style={styles.tag}>
                              <Icon
                                name={
                                  SKILL_ICONS[String(tag).toLowerCase()] ||
                                  'checkmark-circle-outline'
                                }
                                size={13}
                                color={TEAL}
                              />
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          ),
                        )}
                      </View>
                    )}

                    <View style={styles.cardFooter}>
                      {rate != null && rate !== '' ? (
                        <View style={styles.priceBlock}>
                          <View style={styles.rateIcon}>
                            <Icon name="cash-outline" size={16} color={TEAL} />
                          </View>
                          <View>
                            <Text style={styles.rateLabel}>{t('rate', 'Rate')}</Text>
                            <Text style={styles.price}>
                              ৳{formatRate(rate)}
                              <Text style={styles.perHour}> {t('perDay', '/ hr')}</Text>
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.priceBlock} />
                      )}

                      <View
                        style={[
                          styles.selectPill,
                          isSelected && styles.selectPillActive,
                        ]}>
                        <Text
                          style={[
                            styles.selectPillText,
                            isSelected && styles.selectPillTextActive,
                          ]}>
                          {isSelected ? t('selected', 'Selected') : t('select', 'Select')}
                        </Text>
                        {!isSelected ? (
                          <Icon name="arrow-forward" size={14} color="#FFFFFF" />
                        ) : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.bottomContainer,
            {paddingBottom: Math.max(16, insets.bottom + 8)},
          ]}>
          <PrimaryButton
            title={t('next', 'Next')}
            onPress={handleNext}
            disabled={!selectedCaregiver}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SelectCaregiverScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 4,
    minHeight: 56,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: INK,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  searchBox: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F4F7F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    color: INK,
    fontSize: 14,
  },
  areaBanner: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  areaBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeAreaText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEAL,
  },
  filterRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterScroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingRight: 8,
  },
  filterChip: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 16,
    backgroundColor: '#F4F7F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: TEAL,
  },
  filterText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
  },
  sortText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: '700',
  },
  resultCount: {
    marginTop: 14,
    marginBottom: 12,
    fontSize: 13,
    color: MUTED,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAreaButton: {
    marginTop: 18,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAreaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: MUTED,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  caregiverList: {
    flexDirection: 'column',
  },
  caregiverCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EEEC',
    marginBottom: 12,

  },
  selectedCard: {
    borderColor: TEAL,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 78,
    height: 78,
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 18,
    backgroundColor: '#E5E5E5',
  },
  placeholderAvatar: {
    width: 78,
    height: 78,
    borderRadius: 18,
    backgroundColor: '#E8EEEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: INK,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availableDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  availableBadgeText: {
    fontSize: 12,
    color: TEAL,
    fontWeight: '700',
  },
  infoRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoText: {
    marginLeft: 5,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: MUTED,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: TEAL,
    fontWeight: '600',
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateLabel: {
    fontSize: 11,
    color: MUTED,
    marginBottom: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
  },
  perHour: {
    fontSize: 13,
    fontWeight: '500',
    color: MUTED,
  },
  selectPill: {
    minWidth: 96,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  selectPillActive: {
    backgroundColor: TEAL,
  },
  selectPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectPillTextActive: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  nextButton: {
    backgroundColor: TEAL,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  disabledButton: {
    backgroundColor: '#C5CDD6',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
