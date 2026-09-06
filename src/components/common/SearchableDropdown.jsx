import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SearchableDropdown = ({
  data,
  placeholder,
  value,
  onSelect,
  label,
  icon = 'location-outline',
  containerStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSearchText(value);
    }
  }, [value]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = data.filter(item =>
      item.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredData(filtered);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setSearchText(item);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchText('');
    onSelect('');
    setFilteredData(data);
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelect(item)}>
      <Text style={styles.dropdownItemText}>{item}</Text>
      {searchText === item && (
        <Icon name="checkmark" size={20} color="#008178" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.dropdownButton}
        activeOpacity={0.8}
        onPress={() => setIsOpen(true)}>
        <View style={styles.buttonContent}>
          <Icon name={icon} size={18} color="#7D8BA5" />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#7D8BA5"
            value={searchText}
            onChangeText={handleSearch}
            onFocus={() => setIsOpen(true)}
            editable={isOpen}
          />
          {searchText ? (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Icon name="close-circle" size={18} color="#7D8BA5" />
            </TouchableOpacity>
          ) : (
            <Icon name="chevron-down" size={18} color="#7D8BA5" />
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.searchHeader}>
              <Icon name={icon} size={18} color="#7D8BA5" />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${label || placeholder}...`}
                placeholderTextColor="#7D8BA5"
                value={searchText}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchText && (
                <TouchableOpacity onPress={handleClear}>
                  <Icon name="close-circle" size={18} color="#7D8BA5" />
                </TouchableOpacity>
              )}
            </View>
            {filteredData.length > 0 ? (
              <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                style={styles.dropdownList}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View style={styles.noResults}>
                <Icon name="search-outline" size={40} color="#E3E8F0" />
                <Text style={styles.noResultsText}>No results found</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#172333',
    marginBottom: 6,
  },
  dropdownButton: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#172333',
  },
  clearButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: '#E3E8F0',
    overflow: 'hidden',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#172333',
  },
  dropdownList: {
    maxHeight: 350,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#172333',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    color: '#8190A7',
    marginTop: 12,
  },
});

export default SearchableDropdown;
