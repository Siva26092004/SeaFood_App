import { StackNavigationProp } from '@react-navigation/stack';

// Auth Stack Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Customer Stack Types
export type CustomerStackParamList = {
  Home: undefined;
  Cart: undefined;
  Checkout: undefined;
  PaymentWaiting: {
    orderId: string;
    paymentMethod: 'cod' | 'online';
  };
  Profile: undefined;
};

// Admin Stack Types
export type AdminStackParamList = {
  AdminHome: undefined;
  InventoryManagement: undefined;
  ProductForm: {
    productId?: string;
    mode: 'add' | 'edit';
  };
  OrderManagement: undefined;
};

// Root Stack Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Customer: undefined;
  Admin: undefined;
};

// Navigation Props
export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>;
export type CustomerNavigationProp = StackNavigationProp<CustomerStackParamList>;
export type AdminNavigationProp = StackNavigationProp<AdminStackParamList>;
export type RootNavigationProp = StackNavigationProp<RootStackParamList>;
