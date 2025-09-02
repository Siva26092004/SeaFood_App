import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONSTANTS } from '../utils/constants';
import {
  AdminDashboardScreen,
  ProductManagementScreen,
  AddEditProductScreen,
  OrderManagementScreen,
  AdminProfileScreen,
  CustomerManagementScreen,
  ReportsScreen,
} from '../screens/admin';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="AdminDashboard"
      component={AdminDashboardScreen}
      options={{ title: 'Admin Dashboard' }}
    />
    <Stack.Screen
      name="CustomerManagement"
      component={CustomerManagementScreen}
      options={{ title: 'Customer Management' }}
    />
    <Stack.Screen
      name="Reports"
      component={ReportsScreen}
      options={{ title: 'Reports' }}
    />
  </Stack.Navigator>
);

const ProductStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="ProductManagement"
      component={ProductManagementScreen}
      options={{ title: 'Products' }}
    />
    <Stack.Screen
      name="AddProduct"
      component={AddEditProductScreen}
      options={{ title: 'Add Product' }}
    />
    <Stack.Screen
      name="EditProduct"
      component={AddEditProductScreen}
      options={{ title: 'Edit Product' }}
    />
  </Stack.Navigator>
);

const OrderStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="OrderManagement"
      component={OrderManagementScreen}
      options={{ title: 'Orders' }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="AdminProfile"
      component={AdminProfileScreen}
      options={{ title: 'Admin Profile' }}
    />
  </Stack.Navigator>
);

export const AdminStack: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Products':
              iconName = focused ? 'fish' : 'fish-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: APP_CONSTANTS.COLORS.PRIMARY,
        tabBarInactiveTintColor: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: APP_CONSTANTS.COLORS.BORDER,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
      })}
      screenListeners={({ navigation, route }) => ({
        tabPress: (e) => {
          // Reset the stack to the initial screen when tab is pressed
          if (route.name === 'Products') {
            navigation.navigate('Products', { screen: 'ProductManagement' });
          } else if (route.name === 'Orders') {
            navigation.navigate('Orders', { screen: 'OrderManagement' });
          } else if (route.name === 'Dashboard') {
            navigation.navigate('Dashboard', { screen: 'AdminDashboard' });
          } else if (route.name === 'Profile') {
            navigation.navigate('Profile', { screen: 'AdminProfile' });
          }
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Products" component={ProductStack} />
      <Tab.Screen name="Orders" component={OrderStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};
