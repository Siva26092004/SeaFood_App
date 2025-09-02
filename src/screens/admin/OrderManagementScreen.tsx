import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { APP_CONSTANTS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Order, orderService } from '../../services/orderService';
import { adminService } from '../../services/adminService';

interface OrderManagementScreenProps {
  navigation: any;
  route?: {
    params?: {
      filter?: string;
    };
  };
}

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export const OrderManagementScreen: React.FC<OrderManagementScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredVerificationCode, setEnteredVerificationCode] = useState('');

  const statusFilters = [
    { key: 'all', label: 'All Orders', color: '#757575' },
    { key: 'pending', label: 'Pending', color: '#FF9800' },
    { key: 'confirmed', label: 'Confirmed', color: '#2196F3' },
    { key: 'preparing', label: 'Preparing', color: '#9C27B0' },
    { key: 'out_for_delivery', label: 'Out for Delivery', color: '#FF5722' },
    { key: 'delivered', label: 'Delivered', color: '#4CAF50' },
    { key: 'cancelled', label: 'Cancelled', color: '#F44336' },
  ];

  const statusActions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    delivered: [], // No further actions
    cancelled: [], // No further actions
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Set initial filter from route params
    if (route?.params?.filter) {
      setSelectedStatus(route.params.filter);
    }
  }, [route?.params?.filter]);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, route?.params?.filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const filterOrders = () => {
    let filtered = orders;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    if (route?.params?.filter === 'pending') {
      filtered = filtered.filter(order => order.status === 'pending');
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: OrderStatus) => {
    const statusConfig = statusFilters.find(s => s.key === status);
    return statusConfig?.color || '#757575';
  };

  const getStatusDisplayName = (status: OrderStatus) => {
    const statusConfig = statusFilters.find(s => s.key === status);
    return statusConfig?.label || status;
  };

  const handleUpdateOrderStatus = (order: Order) => {
    setSelectedOrder(order);
    setVerificationCode('');
    setEnteredVerificationCode('');
    setUpdateModalVisible(true);
  };

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;

    try {
      // If updating from "out for delivery" to "delivered", verify the code
      if (selectedOrder.status === 'out_for_delivery' && newStatus === 'delivered') {
        if (!enteredVerificationCode.trim()) {
          Alert.alert('Error', 'Please enter the verification code provided by the customer');
          return;
        }

        if (!selectedOrder.verification_code) {
          Alert.alert('Error', 'No verification code found for this order');
          return;
        }

        if (enteredVerificationCode.trim() !== selectedOrder.verification_code) {
          Alert.alert('Error', 'Invalid verification code. Please check with the customer.');
          return;
        }
      }

      // Generate verification code ONLY when marking as "out for delivery"
      let verificationCode: string | undefined;
      if (newStatus === 'out_for_delivery') {
        verificationCode = adminService.generateVerificationCode();
      }

      await orderService.updateOrderStatus(selectedOrder.id, newStatus, verificationCode);
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === selectedOrder.id 
            ? { 
                ...order, 
                status: newStatus, 
                updated_at: new Date().toISOString(),
                verification_code: verificationCode || order.verification_code
              }
            : order
        )
      );

      setUpdateModalVisible(false);
      
      // Show verification code to admin when marking as "out for delivery"
      if (newStatus === 'out_for_delivery' && verificationCode) {
        Alert.alert(
          'Order Ready for Delivery', 
          `Verification Code: ${verificationCode}\n\n✅ This code has been generated for the customer\n✅ Customer can see this code in their order history\n✅ Ask customer for this code before handing over the order\n\nThe delivery person should verify the customer provides this exact code.`,
          [{ text: 'Got It' }]
        );
      } else if (newStatus === 'delivered') {
        Alert.alert('✅ Order Delivered', `Order ${selectedOrder.id} has been successfully delivered to the customer.`);
      } else {
        Alert.alert('Success', `Order ${selectedOrder.id} status updated to ${getStatusDisplayName(newStatus)}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update order status');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStatusFilter = () => (
    <View style={styles.statusContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={statusFilters}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.statusButton,
              selectedStatus === item.key && { backgroundColor: item.color },
            ]}
            onPress={() => setSelectedStatus(item.key)}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatus === item.key && styles.selectedStatusButtonText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderOrder = ({ item }: { item: Order }) => {
    const availableActions = statusActions[item.status] || [];
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.orderAmount}>₹{item.total_amount}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusBadgeText}>{getStatusDisplayName(item.status)}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderDetailRow}>
            <Ionicons name="time-outline" size={16} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
            <Text style={styles.orderDetailText}>{formatDateTime(item.created_at)}</Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Ionicons name="call-outline" size={16} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
            <Text style={styles.orderDetailText}>{item.delivery_phone}</Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Ionicons name="location-outline" size={16} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
            <Text style={styles.orderDetailText}>
              {item.delivery_address.area}, {item.delivery_address.city}
            </Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Ionicons name="card-outline" size={16} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
            <Text style={styles.orderDetailText}>
              {item.payment_method.toUpperCase()} - {item.payment_status}
            </Text>
          </View>
          {item.status === 'out_for_delivery' && item.verification_code && (
            <View style={styles.orderDetailRow}>
              <Ionicons name="key-outline" size={16} color="#4CAF50" />
              <Text style={[styles.orderDetailText, { color: '#4CAF50', fontWeight: '600' }]}>
                Verification Code: {item.verification_code}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate('OrderDetails', { order: item })}
          >
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
          
          {availableActions.length > 0 && (
            <TouchableOpacity
              style={styles.updateStatusButton}
              onPress={() => handleUpdateOrderStatus(item)}
            >
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              <Text style={styles.updateStatusButtonText}>Update Status</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderUpdateModal = () => {
    if (!selectedOrder) return null;
    
    const availableActions = statusActions[selectedOrder.status] || [];

    return (
      <Modal
        visible={updateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                <Ionicons name="close" size={24} color={APP_CONSTANTS.COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalOrderId}>Order: {selectedOrder.id}</Text>
            <Text style={styles.modalCurrentStatus}>
              Current Status: {getStatusDisplayName(selectedOrder.status)}
            </Text>

            <View style={styles.statusActionsContainer}>
              {availableActions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.statusActionButton, { backgroundColor: getStatusColor(status) }]}
                  onPress={() => updateOrderStatus(status)}
                >
                  <Text style={styles.statusActionButtonText}>
                    Mark as {getStatusDisplayName(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedOrder.status === 'out_for_delivery' && availableActions.includes('delivered') && (
              <View style={styles.verificationSection}>
                <Text style={styles.verificationLabel}>Enter Verification Code:</Text>
                <Text style={styles.verificationHint}>
                  Ask the customer for the 4-digit verification code
                </Text>
                <View style={styles.verificationInputContainer}>
                  <TextInput
                    style={styles.verificationInput}
                    placeholder="Enter 4-digit code"
                    value={enteredVerificationCode}
                    onChangeText={setEnteredVerificationCode}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                <Text style={styles.verificationNote}>
                  The customer received this code when the order was marked as "Out for Delivery"
                </Text>
              </View>
            )}

            {/* Show verification code only when order is out for delivery (for admin reference) */}
            {selectedOrder.status === 'out_for_delivery' && selectedOrder.verification_code && (
              <View style={styles.codeDisplaySection}>
                <Text style={styles.codeDisplayLabel}>Order Verification Code (Reference):</Text>
                <Text style={styles.codeDisplayText}>{selectedOrder.verification_code}</Text>
                <Text style={styles.verificationNote}>
                  This is the code the customer should provide
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
      <Text style={styles.emptyStateTitle}>No Orders Found</Text>
      <Text style={styles.emptyStateText}>
        {selectedStatus !== 'all'
          ? `No ${getStatusDisplayName(selectedStatus as OrderStatus).toLowerCase()} orders`
          : 'No orders available'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={APP_CONSTANTS.COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      {renderStatusFilter()}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={filteredOrders.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {renderUpdateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: APP_CONSTANTS.SIZES.PADDING,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  refreshButton: {
    padding: 8,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
  },
  statusButtonText: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  selectedStatusButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  emptyContainer: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.PRIMARY,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderDetails: {
    marginBottom: 16,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderDetailText: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginLeft: 8,
    flex: 1,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  updateStatusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderRadius: 8,
  },
  updateStatusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: APP_CONSTANTS.SIZES.PADDING,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  modalOrderId: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  modalCurrentStatus: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginBottom: 20,
  },
  statusActionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  statusActionButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verificationSection: {
    borderTopWidth: 1,
    borderTopColor: APP_CONSTANTS.COLORS.BORDER,
    paddingTop: 16,
  },
  verificationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  verificationInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  verificationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  generateCodeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateCodeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verificationHint: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  verificationNote: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  codeDisplaySection: {
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
  },
  codeDisplayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  codeDisplayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
    textAlign: 'center',
    letterSpacing: 2,
  },
});
