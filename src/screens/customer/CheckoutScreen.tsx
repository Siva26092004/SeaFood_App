import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { fetchCartItems, clearCart } from '../../store/cartSlice';
import { fetchProfile, updateProfile } from '../../store/profileSlice';
import { orderService, CreateOrderData } from '../../services/orderService';
import { profileService } from '../../services/profileService';
import { APP_CONSTANTS } from '../../utils/constants';
import { CustomerStackParamList } from '../../types/navigation';
import { CartItem } from '../../services/cartService';
import { CustomModal, ToastModal, ConfirmModal } from '../../components/modals';
import { useModal } from '../../hooks/useModal';

type NavigationProp = StackNavigationProp<CustomerStackParamList>;

interface DeliveryAddress {
  street: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
}

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items, totalPrice, totalItems, isLoading } = useAppSelector((state) => state.cart);
  const { profile, isLoading: profileLoading } = useAppSelector((state) => state.profile);

  const { 
    showModal, 
    isModalVisible, 
    modalProps, 
    hideModal,
    showToast, 
    isToastVisible, 
    toastProps, 
    hideToast,
    showConfirm,
    isConfirmVisible,
    confirmProps,
    hideConfirm
  } = useModal();

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    area: '',
    city: '',
    pincode: '',
    landmark: '',
  });

  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true); // New state to save address

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
      dispatch(fetchProfile(user.id));
    }
  }, [user?.id, dispatch]);

  // Load saved address when profile is fetched
  useEffect(() => {
    if (profile && profileService.hasCompleteAddress(profile)) {
      console.log('🏠 CheckoutScreen - Loading saved address from profile');
      setDeliveryAddress({
        street: profile.address_line1 || '',
        area: profile.address_line2 || '',
        city: profile.city || '',
        pincode: profile.postal_code || '',
        landmark: profile.landmark || '',
      });
      setDeliveryPhone(profile.phone || user?.phone || '');
    }
  }, [profile, user?.phone]);

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  const saveAddressToProfile = async () => {
    if (!user?.id || !saveAddress) return;

    try {
      console.log('💾 CheckoutScreen - Saving address to profile');
      await dispatch(updateProfile({
        userId: user.id,
        updates: {
          address_line1: deliveryAddress.street,
          address_line2: deliveryAddress.area,
          city: deliveryAddress.city,
          postal_code: deliveryAddress.pincode,
          landmark: deliveryAddress.landmark,
          phone: deliveryPhone,
        }
      })).unwrap();
      console.log('✅ CheckoutScreen - Address saved to profile successfully');
    } catch (error) {
      console.error('❌ CheckoutScreen - Failed to save address to profile:', error);
      // Don't block the order if address saving fails
    }
  };

  const validateForm = (): boolean => {
    if (!deliveryAddress.street.trim()) {
      showModal('Error', 'Please enter your street address', 'error');
      return false;
    }
    if (!deliveryAddress.area.trim()) {
      showModal('Error', 'Please enter your area', 'error');
      return false;
    }
    if (!deliveryAddress.city.trim()) {
      showModal('Error', 'Please enter your city', 'error');
      return false;
    }
    if (!deliveryAddress.pincode.trim()) {
      showModal('Error', 'Please enter your pincode', 'error');
      return false;
    }
    if (!deliveryPhone.trim()) {
      showModal('Error', 'Please enter your phone number', 'error');
      return false;
    }
    if (deliveryPhone.length < 10) {
      showModal('Error', 'Please enter a valid phone number', 'error');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (items.length === 0) {
      showModal('Error', 'Your cart is empty', 'warning');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Save address to profile first (if requested)
      await saveAddressToProfile();

      console.log('🛒 CheckoutScreen - Placing order:', {
        userId: user?.id,
        items: items.length,
        totalPrice,
        deliveryAddress,
        deliveryPhone,
        paymentMethod
      });

      // Prepare order data
      const orderData: CreateOrderData = {
        customer_id: user!.id,
        total_amount: totalPrice,
        payment_method: paymentMethod,
        delivery_address: deliveryAddress,
        delivery_phone: deliveryPhone,
        delivery_notes: deliveryNotes || undefined,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.product?.price || 0,
          total_price: (item.product?.price || 0) * item.quantity
        }))
      };

      // Create the order
      const order = await orderService.createOrder(orderData);
      console.log('✅ CheckoutScreen - Order created successfully:', order.id);

      // Clear the cart after successful order
      if (user?.id) {
        await dispatch(clearCart(user.id)).unwrap();
        console.log('✅ CheckoutScreen - Cart cleared successfully');
      }

      showConfirm(
        'Order Placed Successfully!',
        `Your order #${order.verification_code} for ₹${totalPrice.toFixed(2)} has been placed. You will receive a confirmation shortly.`,
        () => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'CustomerTabs',
                state: {
                  routes: [
                    { name: 'Orders' }
                  ]
                }
              }
            ]
          });
        },
        'info',
        'View Orders',
        'OK'
      );

    } catch (error: any) {
      console.error('❌ CheckoutScreen - Order placement failed:', error);
      showModal('Error', error.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to format weight
  const formatWeight = (quantity: number): string => {
    if (quantity < 1) {
      return `${Math.round(quantity * 1000)}g`;
    }
    return `${quantity}kg`;
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.orderItem}>
      <Image
        source={{ uri: item.product?.image_url || 'https://via.placeholder.com/50x50/CCCCCC/FFFFFF?text=No+Image' }}
        style={styles.itemImage}
        defaultSource={{ uri: 'https://via.placeholder.com/50x50/CCCCCC/FFFFFF?text=No+Image' }}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product?.name}</Text>
        <Text style={styles.itemDetails}>
          ₹{item.product?.price}/kg × {formatWeight(item.quantity)}
        </Text>
      </View>
      <Text style={styles.itemTotal}>
        ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <FlatList
          data={items}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total ({totalItems} items)</Text>
          <Text style={styles.totalAmount}>₹{totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {profile && profileService.hasCompleteAddress(profile) && (
            <View style={styles.savedAddressIndicator}>
              <Icon name="checkmark-circle" size={16} color={APP_CONSTANTS.COLORS.SUCCESS} />
              <Text style={styles.savedAddressText}>Saved</Text>
            </View>
          )}
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Street Address"
          value={deliveryAddress.street}
          onChangeText={(value) => handleAddressChange('street', value)}
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Area/Locality"
          value={deliveryAddress.area}
          onChangeText={(value) => handleAddressChange('area', value)}
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="City"
            value={deliveryAddress.city}
            onChangeText={(value) => handleAddressChange('city', value)}
            placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Pincode"
            value={deliveryAddress.pincode}
            onChangeText={(value) => handleAddressChange('pincode', value)}
            keyboardType="numeric"
            placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
          />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Landmark (Optional)"
          value={deliveryAddress.landmark}
          onChangeText={(value) => handleAddressChange('landmark', value)}
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />

        {/* Save Address Toggle */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Save address to my profile</Text>
          <Switch
            value={saveAddress}
            onValueChange={setSaveAddress}
            trackColor={{ false: APP_CONSTANTS.COLORS.BORDER, true: APP_CONSTANTS.COLORS.PRIMARY }}
            thumbColor={saveAddress ? '#FFFFFF' : '#F4F4F4'}
          />
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={deliveryPhone}
          onChangeText={setDeliveryPhone}
          keyboardType="phone-pad"
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Delivery Notes (Optional)"
          value={deliveryNotes}
          onChangeText={setDeliveryNotes}
          multiline
          numberOfLines={3}
          placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
        />
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'cod' && styles.selectedPayment
          ]}
          onPress={() => setPaymentMethod('cod')}
        >
          <Icon 
            name="cash-outline" 
            size={24} 
            color={paymentMethod === 'cod' ? APP_CONSTANTS.COLORS.PRIMARY : APP_CONSTANTS.COLORS.TEXT_SECONDARY} 
          />
          <Text style={[
            styles.paymentText,
            paymentMethod === 'cod' && styles.selectedPaymentText
          ]}>
            Cash on Delivery
          </Text>
          {paymentMethod === 'cod' && (
            <Icon name="checkmark-circle" size={20} color={APP_CONSTANTS.COLORS.PRIMARY} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'online' && styles.selectedPayment
          ]}
          onPress={() => setPaymentMethod('online')}
        >
          <Icon 
            name="card-outline" 
            size={24} 
            color={paymentMethod === 'online' ? APP_CONSTANTS.COLORS.PRIMARY : APP_CONSTANTS.COLORS.TEXT_SECONDARY} 
          />
          <Text style={[
            styles.paymentText,
            paymentMethod === 'online' && styles.selectedPaymentText
          ]}>
            Online Payment
          </Text>
          {paymentMethod === 'online' && (
            <Icon name="checkmark-circle" size={20} color={APP_CONSTANTS.COLORS.PRIMARY} />
          )}
        </TouchableOpacity>
      </View>

      {/* Place Order Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            isProcessing && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          <Text style={styles.placeOrderText}>
            {isProcessing ? 'Placing Order...' : `Place Order - ₹${totalPrice.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
      
      <CustomModal
        visible={isModalVisible}
        onClose={hideModal}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
      />
      
      <ConfirmModal
        visible={isConfirmVisible}
        onClose={hideConfirm}
        onConfirm={confirmProps.onConfirm}
        title={confirmProps.title}
        message={confirmProps.message}
        type={confirmProps.type}
        confirmText={confirmProps.confirmText}
        cancelText={confirmProps.cancelText}
      />
      
      <ToastModal
        visible={isToastVisible}
        message={toastProps.message}
        type={toastProps.type}
        duration={toastProps.duration}
        onHide={hideToast}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: APP_CONSTANTS.SIZES.PADDING,
    padding: APP_CONSTANTS.SIZES.PADDING,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  savedAddressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedAddressText: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.SUCCESS,
    marginLeft: 4,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: APP_CONSTANTS.COLORS.PRIMARY,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  input: {
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPayment: {
    borderColor: APP_CONSTANTS.COLORS.PRIMARY,
    backgroundColor: '#E3F2FD',
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  selectedPaymentText: {
    color: APP_CONSTANTS.COLORS.PRIMARY,
    fontWeight: '600',
  },
  bottomSection: {
    padding: APP_CONSTANTS.SIZES.PADDING,
    paddingBottom: 30,
  },
  placeOrderButton: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: APP_CONSTANTS.COLORS.GRAY,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    flex: 1,
  },
});
