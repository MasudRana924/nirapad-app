import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const SearchableDropdown = ({
  data = [],
  placeholder,
  value,
  onSelect,
  label,
  icon = 'location-outline',
  containerStyle,
  variant = 'default',
  disabled = false,
}) => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSearchText, setModalSearchText] = useState('');

  const filteredData = useMemo(() => {
    if (!modalSearchText) {
      return data || [];
    }
    return (data || []).filter(item =>
      item.toLowerCase().includes(modalSearchText.toLowerCase()),
    );
  }, [data, modalSearchText]);

  const handleOpen = () => {
    if (disabled) {
      return;
    }
    setModalSearchText('');
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setModalSearchText('');
  };

  const handleSelect = item => {
    onSelect(item);
    handleClose();
  };

  const handleClear = () => {
    onSelect('');
  };

  const isPill = variant === 'pill';
  const isLight = variant === 'light';

  const titleText = label
    ? `Select ${label}`
    : placeholder || 'Select Option';

  return (
    <View
      style={[
        styles.container,
        isPill && styles.pillContainer,
        isLight && styles.lightContainer,
        containerStyle,
      ]}>
      {!!label && !isPill && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.dropdownButton,
          isPill && styles.pillButton,
          isLight && styles.lightButton,
          modalVisible && styles.dropdownButtonActive,
        ]}
        activeOpacity={0.85}
        onPress={handleOpen}>
        <View style={styles.buttonContent}>
          <Icon name={icon} size={18} color={isPill ? '#008178' : '#8190A7'} />
          <View style={styles.inputWrap}>
            {!!label && isPill && <Text style={styles.pillLabel}>{label}</Text>}
            <Text
              style={[
                styles.valueText,
                isPill && styles.pillValueText,
                !value && styles.placeholderText,
              ]}
              numberOfLines={1}>
              {value || placeholder}
            </Text>
          </View>
          {value ? (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="close-circle" size={18} color="#8190A7" />
            </TouchableOpacity>
          ) : (
            <Icon name="chevron-down" size={18} color="#8190A7" />
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardAvoid}>
                <View
                  style={[
                    styles.modalSheet,
                    {paddingBottom: Math.max(insets.bottom + 12, 20)},
                  ]}>
                  <View style={styles.handleRow}>
                    <View style={styles.handle} />
                  </View>

                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{titleText}</Text>
                    <TouchableOpacity
                      onPress={handleClose}
                      style={styles.closeBtn}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                      <Icon name="close" size={20} color="#8190A7" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.searchBarContainer}>
                    <Icon
                      name="search-outline"
                      size={18}
                      color="#8190A7"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.modalSearchInput}
                      placeholder={`Search ${
                        label ? label.toLowerCase() : 'here'
                      }...`}
                      placeholderTextColor="#8190A7"
                      value={modalSearchText}
                      onChangeText={setModalSearchText}
                      autoCapitalize="none"
                    />
                    {!!modalSearchText && (
                      <TouchableOpacity
                        onPress={() => setModalSearchText('')}
                        style={styles.clearSearchBtn}
                        hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                        <Icon name="close-circle" size={18} color="#8190A7" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <ScrollView
                    style={styles.modalList}
                    contentContainerStyle={styles.modalListContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => {
                        const selected = value === item;
                        return (
                          <TouchableOpacity
                            key={`${item}-${index}`}
                            style={[
                              styles.modalItem,
                              index === filteredData.length - 1 &&
                                styles.modalItemLast,
                              selected && styles.modalItemSelected,
                            ]}
                            onPress={() => handleSelect(item)}
                            activeOpacity={0.7}>
                            <Text
                              style={[
                                styles.modalItemText,
                                selected && styles.modalItemTextSelected,
                              ]}
                              numberOfLines={1}>
                              {item}
                            </Text>
                            {selected && (
                              <Icon
                                name="checkmark-circle"
                                size={20}
                                color="#008178"
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={styles.noResults}>
                        <Icon
                          name="search-outline"
                          size={36}
                          color="#C5CDD6"
                          style={styles.noResultsIcon}
                        />
                        <Text style={styles.noResultsText}>
                          No options found
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default SearchableDropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  pillContainer: {
    marginBottom: 0,
  },
  lightContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111820',
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },
  pillButton: {
    backgroundColor: '#F3FAF7',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7EBE6',
  },
  lightButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEEE9',
  },
  dropdownButtonActive: {
    borderColor: '#008178',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: 11,
    color: '#7B9390',
    marginBottom: 1,
  },
  valueText: {
    fontSize: 15,
    color: '#111820',
    fontWeight: '500',
  },
  pillValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#163532',
  },
  placeholderText: {
    color: '#8190A7',
    fontWeight: '400',
  },
  clearButton: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: 520,
    paddingHorizontal: 20,
  },
  handleRow: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#163532',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
    paddingHorizontal: 12,
    height: 44,
    marginVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111820',
    padding: 0,
  },
  clearSearchBtn: {
    padding: 2,
    marginLeft: 6,
  },
  modalList: {
    maxHeight: 340,
  },
  modalListContent: {
    paddingBottom: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F3',
  },
  modalItemLast: {
    borderBottomWidth: 0,
  },
  modalItemSelected: {
    backgroundColor: '#F3FAF7',
    borderRadius: 10,
    marginHorizontal: -4,
    paddingHorizontal: 12,
  },
  modalItemText: {
    fontSize: 15,
    color: '#111820',
    fontWeight: '400',
    flex: 1,
  },
  modalItemTextSelected: {
    color: '#008178',
    fontWeight: '700',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  noResultsIcon: {
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#8190A7',
  },
});

