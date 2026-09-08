import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/common/Header';
import SearchableDropdown from '../components/common/SearchableDropdown';
import {bangladeshDistricts} from '../data/bangladeshLocations';
import {getThanasByDistrict} from '../data/bangladeshThanas';
import {storage} from '../utils/storage';

const AreaSelectScreen = ({navigation, route}) => {
  const {selectedMember, serviceType = 'caregiver'} = route.params || {};
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');

  const thanaOptions = useMemo(() => getThanasByDistrict(district), [district]);

  const handleDistrictSelect = value => {
    setDistrict(value);
    setThana('');
  };

  const canContinue = !!district && !!thana;

  const handleNext = async () => {
    if (!district || !thana) {
      Alert.alert('Select area', 'Please select both district and thana');
      return;
    }

    const selectedArea = {district, thana};
    await storage.saveSelectedArea(selectedArea);

    navigation?.navigate('SelectCaregiver', {
      selectedMember,
      selectedArea,
      district,
      thana,
      serviceType,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Select area" onBack={() => navigation?.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Icon name="map-outline" size={24} color="#008178" />
          </View>
          <Text style={styles.heroTitle}>Where do you need care?</Text>
          <Text style={styles.heroText}>
            Choose your district and thana so we can show caregivers near you
          </Text>
        </View>

        <SearchableDropdown
          data={bangladeshDistricts}
          label="District"
          placeholder="Select district"
          value={district}
          onSelect={handleDistrictSelect}
          icon="business-outline"
        />

        <SearchableDropdown
          data={thanaOptions}
          label="Thana"
          placeholder={district ? 'Select thana' : 'Select district first'}
          value={thana}
          onSelect={setThana}
          icon="location-outline"
        />

        {!district && (
          <Text style={styles.hint}>Select a district to load thana list</Text>
        )}
        {!!district && thanaOptions.length === 0 && (
          <Text style={styles.hint}>No thana list found for this district</Text>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.nextButton, !canContinue && styles.disabledButton]}
          onPress={handleNext}
          disabled={!canContinue}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AreaSelectScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  hero: {
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    alignItems: 'flex-start',
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 6,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8190A7',
  },
  hint: {
    marginTop: 4,
    fontSize: 13,
    color: '#8190A7',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#B5C0D0',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
