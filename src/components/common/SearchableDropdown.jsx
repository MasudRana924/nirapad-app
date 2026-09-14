import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SearchableDropdown = ({
  data = [],
  placeholder,
  value,
  onSelect,
  label,
  icon = 'location-outline',
  containerStyle,
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const containerRef = useRef(null);

  useEffect(() => {
    setSearchText(value || '');
  }, [value]);

  useEffect(() => {
    setFilteredData(data || []);
  }, [data]);

  const handleSearch = text => {
    setSearchText(text);
    if (!isOpen) {
      setIsOpen(true);
    }
    const filtered = (data || []).filter(item =>
      item.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredData(filtered);
  };

  const handleSelect = item => {
    onSelect(item);
    setSearchText(item);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchText('');
    onSelect('');
    setFilteredData(data || []);
    setIsOpen(true);
  };

  const handleToggle = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setFilteredData(data || []);
    }
  };

  const isPill = variant === 'pill';
  const isLight = variant === 'light';

  return (
    <View
      ref={containerRef}
      style={[
        styles.container,
        isPill && styles.pillContainer,
        isLight && styles.lightContainer,
        isOpen && styles.containerOpen,
        containerStyle,
      ]}>
      {!!label && !isPill && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.dropdownButton,
          isPill && styles.pillButton,
          isLight && styles.lightButton,
          isOpen && styles.dropdownButtonOpen,
          isPill && isOpen && styles.pillButtonOpen,
        ]}
        activeOpacity={0.85}
        onPress={handleToggle}>
        <View style={styles.buttonContent}>
          <Icon name={icon} size={18} color={isPill ? '#008178' : '#8190A7'} />
          <View style={styles.inputWrap}>
            {!!label && isPill && <Text style={styles.pillLabel}>{label}</Text>}
            <TextInput
              style={[styles.input, isPill && styles.pillInput]}
              placeholder={placeholder}
              placeholderTextColor="#8190A7"
              value={searchText}
              onChangeText={handleSearch}
              onFocus={() => {
                setIsOpen(true);
                setFilteredData(data || []);
              }}
            />
          </View>
          {searchText ? (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="close-circle" size={18} color="#8190A7" />
            </TouchableOpacity>
          ) : (
            <Icon
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#8190A7"
            />
          )}
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownPanel}>
          {filteredData.length > 0 ? (
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}>
              {filteredData.map((item, index) => {
                const selected = searchText === item || value === item;
                return (
                  <TouchableOpacity
                    key={`${item}-${index}`}
                    style={[
                      styles.dropdownItem,
                      index === filteredData.length - 1 && styles.dropdownItemLast,
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.75}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selected && styles.dropdownItemTextSelected,
                      ]}
                      numberOfLines={1}>
                      {item}
                    </Text>
                    {selected && (
                      <Icon name="checkmark" size={18} color="#008178" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No results found</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SearchableDropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    zIndex: 1,
  },
  containerOpen: {
    zIndex: 20,
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
    backgroundColor: '#F6F6F6',
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
    backgroundColor: '#F7FBFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEEE9',
  },
  dropdownButtonOpen: {
    borderColor: '#008178',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  pillButtonOpen: {
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
    minWidth: 0,
  },
  pillLabel: {
    fontSize: 11,
    color: '#7B9390',
    marginBottom: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111820',
    paddingVertical: 0,
  },
  pillInput: {
    flex: 0,
    height: 20,
    fontSize: 14,
    fontWeight: '700',
    color: '#163532',
  },
  clearButton: {
    padding: 2,
  },
  dropdownPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#008178',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    maxHeight: 220,
    overflow: 'hidden',
  },
  dropdownList: {
    maxHeight: 220,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: '#111820',
    paddingRight: 8,
  },
  dropdownItemTextSelected: {
    color: '#008178',
    fontWeight: '600',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noResultsText: {
    fontSize: 13,
    color: '#8190A7',
  },
});
