import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const CheckoutScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {cart = {}, medicines = []} = route?.params || {};

  const [selectedPayment, setSelectedPayment] = useState('bkash');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const getCartItems = () => {
    return Object.entries(cart).map(([id, quantity]) => {
      const medicine = medicines.find(m => m.id === parseInt(id));
      return {...medicine, quantity};
    });
  };

  const getTotalPrice = () => {
    return getCartItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const cartItems = getCartItems();

  const handlePlaceOrder = () => {
    if (!address || !phone) {
      alert('Please fill in all required fields');
      return;
    }
    navigation?.navigate('BookingConfirmed');
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

        <Text style={styles.headerTitle}>Checkout</Text>

        <View style={{width: 38}} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.checkoutContent}>
        {/* ================= DELIVERY ADDRESS ================= */}

        <Text style={styles.sectionTitle}>Delivery Address</Text>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Icon name="location-sharp" size={20} color="#7D8BA5" />
            <TextInput
              style={styles.input}
              placeholder="Enter your address"
              placeholderTextColor="#8190A7"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="call-outline" size={20} color="#7D8BA5" />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#8190A7"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* ================= PAYMENT METHOD ================= */}

        <Text style={styles.sectionTitle}>Payment Method</Text>

        <View style={styles.paymentSection}>
          {/* bKash */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.paymentOption, selectedPayment === 'bkash' && styles.paymentOptionSelected]}
            onPress={() => setSelectedPayment('bkash')}>
            <View style={styles.paymentLeft}>
              <View style={styles.bkashIcon}>
                <Text style={styles.bkashText}>b</Text>
              </View>
              <Text style={styles.paymentLabel}>bKash</Text>
            </View>

            <View style={[styles.radioButton, selectedPayment === 'bkash' && styles.radioButtonSelected]}>
              {selectedPayment === 'bkash' && (
                <Icon name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>

          {/* Cash on Delivery */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.paymentOption, selectedPayment === 'cod' && styles.paymentOptionSelected]}
            onPress={() => setSelectedPayment('cod')}>
            <View style={styles.paymentLeft}>
              <View style={styles.codIcon}>
                <Icon name="cash-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.paymentLabel}>Cash on Delivery</Text>
            </View>

            <View style={[styles.radioButton, selectedPayment === 'cod' && styles.radioButtonSelected]}>
              {selectedPayment === 'cod' && (
                <Icon name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= ORDER SUMMARY ================= */}

        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.summarySection}>
          {cartItems.map(item => (
            <View key={item.id} style={styles.summaryItem}>
              <View style={styles.summaryItemLeft}>
                <Text style={styles.summaryItemName}>{item.name}</Text>
                <Text style={styles.summaryItemQuantity}>x{item.quantity}</Text>
              </View>

              <Text style={styles.summaryItemPrice}>৳{item.price * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>৳{getTotalPrice()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>৳50</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelTotal}>Total</Text>
            <Text style={styles.summaryValueTotal}>৳{getTotalPrice() + 50}</Text>
          </View>
        </View>

        {/* Space for bottom bar */}
        <View style={{height: 80 + insets.bottom}} />
      </ScrollView>

      {/* ================= BOTTOM BAR ================= */}

      <View style={[styles.bottomBar, {bottom: insets.bottom}]}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Total Amount</Text>
          <Text style={styles.bottomPrice}>৳{getTotalPrice() + 50}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderButtonText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#1A1D23',
  },

  // =====================================================
  // CONTENT
  // =====================================================

  checkoutContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D23',
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // =====================================================
  // INPUT SECTION
  // =====================================================

  inputSection: {
    marginBottom: 4,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8ECF2',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1A1D23',
    fontWeight: '500',
  },

  // =====================================================
  // PAYMENT SECTION
  // =====================================================

  paymentSection: {
    marginBottom: 4,
  },

  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8ECF2',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },

  paymentOptionSelected: {
    borderColor: '#2478D4',
    backgroundColor: '#F0F7FF',
    shadowColor: '#2478D4',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bkashIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#E2136E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#E2136E',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  bkashText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },

  codIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2478D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#2478D4',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  paymentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D23',
    letterSpacing: -0.2,
  },

  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#D1D8E0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioButtonSelected: {
    backgroundColor: '#2478D4',
    borderColor: '#2478D4',
  },

  // =====================================================
  // SUMMARY SECTION
  // =====================================================

  summarySection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8ECF2',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  summaryItemLeft: {
    flex: 1,
  },

  summaryItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D23',
    marginBottom: 2,
  },

  summaryItemQuantity: {
    fontSize: 13,
    color: '#8B95A5',
    fontWeight: '500',
  },

  summaryItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2478D4',
  },

  divider: {
    height: 1.5,
    backgroundColor: '#EEF2F6',
    marginVertical: 16,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D23',
  },

  summaryLabelTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D23',
  },

  summaryValueTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2478D4',
  },

  // =====================================================
  // BOTTOM BAR
  // =====================================================

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#EEF2F6',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },

  bottomInfo: {
    flex: 1,
  },

  bottomLabel: {
    fontSize: 12,
    color: '#8B95A5',
    fontWeight: '500',
    marginBottom: 2,
  },

  bottomPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2478D4',
    letterSpacing: -0.5,
  },

  placeOrderButton: {
    backgroundColor: '#2478D4',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#2478D4',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  placeOrderButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
