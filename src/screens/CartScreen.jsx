import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const CartScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {cart = {}, medicines = []} = route?.params || {};

  const [localCart, setLocalCart] = useState(cart);

  const updateQuantity = (medicineId, delta) => {
    setLocalCart(prev => {
      const newCart = {...prev};
      const currentQuantity = newCart[medicineId] || 0;
      const newQuantity = currentQuantity + delta;

      if (newQuantity <= 0) {
        delete newCart[medicineId];
      } else {
        newCart[medicineId] = newQuantity;
      }
      return newCart;
    });
  };

  const removeItem = medicineId => {
    setLocalCart(prev => {
      const newCart = {...prev};
      delete newCart[medicineId];
      return newCart;
    });
  };

  const getCartItems = () => {
    return Object.entries(localCart).map(([id, quantity]) => {
      const medicine = medicines.find(m => m.id === parseInt(id));
      return {...medicine, quantity};
    });
  };

  const getTotalPrice = () => {
    return getCartItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const cartItems = getCartItems();

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

        <Text style={styles.headerTitle}>My Cart</Text>

        <View style={{width: 38}} />
      </View>

      {/* ================= CART ITEMS ================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartContent}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Icon name="cart-outline" size={64} color="#C8D0DC" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.shopButton}
              onPress={() => navigation?.navigate('Medicine')}>
              <Text style={styles.shopButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartItems.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{uri: item.image}} style={styles.itemImage} />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>

                  <View style={styles.itemBottom}>
                    <Text style={styles.itemPrice}>৳{item.price}</Text>

                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, -1)}>
                        <Icon name="remove" size={16} color="#1473DC" />
                      </TouchableOpacity>

                      <Text style={styles.quantityText}>{item.quantity}</Text>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, 1)}>
                        <Icon name="add" size={16} color="#1473DC" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.removeButton}
                  onPress={() => removeItem(item.id)}>
                  <Icon name="trash-outline" size={20} color="#E34242" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Space for bottom bar */}
            <View style={{height: 80 + insets.bottom}} />
          </>
        )}
      </ScrollView>

      {/* ================= BOTTOM BAR ================= */}

      {cartItems.length > 0 && (
        <View style={[styles.bottomBar, {bottom: insets.bottom}]}>
          <View style={styles.bottomInfo}>
            <Text style={styles.bottomLabel}>Total ({cartItems.length} items)</Text>
            <Text style={styles.bottomPrice}>৳{getTotalPrice()}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.checkoutButton}
            onPress={() => navigation?.navigate('Checkout', {cart: localCart, medicines})}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

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
    flex: 1,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: '#182331',
  },

  // =====================================================
  // CART CONTENT
  // =====================================================

  cartContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
  },

  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8190A7',
    marginTop: 16,
  },

  shopButton: {
    backgroundColor: '#2478D4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },

  shopButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // =====================================================
  // CART ITEM
  // =====================================================

  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE4EE',
    marginBottom: 12,
    padding: 12,
    alignItems: 'center',
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E9EDF3',
    marginRight: 12,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#182331',
    marginBottom: 2,
  },

  itemDescription: {
    fontSize: 12,
    color: '#8190A7',
    marginBottom: 8,
  },

  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemPrice: {
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

  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  checkoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
