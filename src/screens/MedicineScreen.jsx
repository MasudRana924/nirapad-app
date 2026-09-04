import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  TextInput,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const medicines = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    description: 'Pain reliever & fever reducer',
    price: 25,
    image: 'https://via.placeholder.com/60',
    category: 'Pain Relief',
  },
  {
    id: 2,
    name: 'Amoxicillin 250mg',
    description: 'Antibiotic for infections',
    price: 120,
    image: 'https://via.placeholder.com/60',
    category: 'Antibiotics',
  },
  {
    id: 3,
    name: 'Omeprazole 20mg',
    description: 'Acid reflux & heartburn',
    price: 85,
    image: 'https://via.placeholder.com/60',
    category: 'Digestive',
  },
  {
    id: 4,
    name: 'Metformin 500mg',
    description: 'Diabetes management',
    price: 45,
    image: 'https://via.placeholder.com/60',
    category: 'Diabetes',
  },
  {
    id: 5,
    name: 'Cetirizine 10mg',
    description: 'Allergy relief',
    price: 35,
    image: 'https://via.placeholder.com/60',
    category: 'Allergy',
  },
  {
    id: 6,
    name: 'Ibuprofen 400mg',
    description: 'Anti-inflammatory pain relief',
    price: 40,
    image: 'https://via.placeholder.com/60',
    category: 'Pain Relief',
  },
  {
    id: 7,
    name: 'Vitamin D3 1000IU',
    description: 'Bone health supplement',
    price: 150,
    image: 'https://via.placeholder.com/60',
    category: 'Supplements',
  },
  {
    id: 8,
    name: 'Aspirin 75mg',
    description: 'Blood thinner',
    price: 30,
    image: 'https://via.placeholder.com/60',
    category: 'Heart',
  },
];

const categories = ['All', 'Pain Relief', 'Antibiotics', 'Digestive', 'Supplements'];

const MedicineScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState('');

  const filteredMedicines = medicines.filter(item => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = medicine => {
    setCart(prev => ({
      ...prev,
      [medicine.id]: (prev[medicine.id] || 0) + 1,
    }));
  };

  const removeFromCart = medicineId => {
    setCart(prev => {
      const newCart = {...prev};
      if (newCart[medicineId] > 1) {
        newCart[medicineId]--;
      } else {
        delete newCart[medicineId];
      }
      return newCart;
    });
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [id, count]) => {
      const medicine = medicines.find(m => m.id === parseInt(id));
      return sum + (medicine ? medicine.price * count : 0);
    }, 0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={() => navigation?.goBack()}>
          <Icon name="arrow-back" size={27} color="#182331" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>All Medicines</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.cartButton}
          onPress={() => navigation?.navigate('Cart', {cart, medicines})}>
          <Icon name="cart-outline" size={24} color="#182331" />

          {getCartCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ================= SEARCH & FILTER ================= */}

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={22}
            color="#7D8BA3"
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            placeholderTextColor="#7D8BA3"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.filterButton}>
          <Icon name="options-outline" size={23} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ================= MEDICINE LIST ================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.medicineList}>
        {filteredMedicines.map(medicine => (
          <View key={medicine.id} style={styles.medicineCard}>
            <Image source={{uri: medicine.image}} style={styles.medicineImage} />

            <View style={styles.medicineInfo}>
              <Text style={styles.medicineName}>{medicine.name}</Text>
              <Text style={styles.medicineDescription}>{medicine.description}</Text>
              <Text style={styles.medicineCategory}>{medicine.category}</Text>

              <View style={styles.medicineBottom}>
                <Text style={styles.medicinePrice}>৳{medicine.price}</Text>

                <View style={styles.quantityControl}>
                  {cart[medicine.id] ? (
                    <>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.quantityButton}
                        onPress={() => removeFromCart(medicine.id)}>
                        <Icon name="remove" size={16} color="#1473DC" />
                      </TouchableOpacity>

                      <Text style={styles.quantityText}>{cart[medicine.id]}</Text>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.quantityButton}
                        onPress={() => addToCart(medicine)}>
                        <Icon name="add" size={16} color="#1473DC" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.addButton}
                      onPress={() => addToCart(medicine)}>
                      <Icon name="add" size={16} color="#FFFFFF" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ================= BOTTOM BAR ================= */}

      {getCartCount() > 0 && (
        <View style={[styles.bottomBar, {bottom: insets.bottom}]}>
          <View style={styles.bottomInfo}>
            <Text style={styles.bottomLabel}>Total</Text>
            <Text style={styles.bottomPrice}>৳{getTotalPrice()}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.checkoutButton}
            onPress={() => navigation?.navigate('Cart', {cart, medicines})}>
            <Text style={styles.checkoutButtonText}>
              Checkout ({getCartCount()} items)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MedicineScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 18,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#E9EEF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTitle: {
   fontSize: 15,
    fontWeight: 'bold',
    color: '#11182e',
    flex: 1,
    textAlign: 'center',
  },

  cartButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  cartBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E34242',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // =====================================================
  // SEARCH
  // =====================================================

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },

  searchContainer: {
    flex: 1,
    height: 50,
    borderRadius: 17,
    backgroundColor: '#EFF2F7',
    borderWidth: 1,
    borderColor: '#EFF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginRight: 9,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#172033',
  },

  filterButton: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: '#1473DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // =====================================================
  // CATEGORIES
  // =====================================================

  categoryScroll: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
  },

  categoryChip: {
    height: 36,
    borderRadius: 19,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  categoryChipActive: {
    backgroundColor: '#2478D4',
    borderColor: '#2478D4',
  },

  categoryText: {
    fontSize: 13,
    color: '#7D8BA5',
    fontWeight: '500',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  // =====================================================
  // MEDICINE LIST
  // =====================================================

  medicineList: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },

  medicineCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE4EE',
    marginBottom: 12,
    padding: 12,
  },

  medicineImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#E9EDF3',
    marginRight: 12,
  },

  medicineInfo: {
    flex: 1,
  },

  medicineName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#182331',
    marginBottom: 2,
  },

  medicineDescription: {
    fontSize: 12,
    color: '#8190A7',
    marginBottom: 4,
  },

  medicineCategory: {
    fontSize: 11,
    color: '#1473DC',
    fontWeight: '500',
    marginBottom: 8,
  },

  medicineBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  medicinePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1473DC',
  },

  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E9F1FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#182331',
    marginHorizontal: 10,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2478D4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },

  // =====================================================
  // BOTTOM BAR
  // =====================================================

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DDE4EE',
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bottomInfo: {
    flex: 1,
  },

  bottomLabel: {
    fontSize: 12,
    color: '#8190A7',
  },

  bottomPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1473DC',
  },

  checkoutButton: {
    backgroundColor: '#2478D4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  checkoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
