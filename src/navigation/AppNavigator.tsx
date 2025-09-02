import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { checkAuthStatus } from '../store/authSlice';

import { SplashScreen } from '../screens/SplashScreen';
import { AuthStack } from './AuthStack';
import { CustomerStack } from './CustomerStack';
import { AdminStack } from './AdminStack';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    console.log('🚀 AppNavigator - Starting auth status check on app load');
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    console.log('🔄 AppNavigator - Auth state changed:', {
      isAuthenticated,
      isLoading,
      userId: user?.id,
      userRole: user?.role,
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    console.log('⏳ AppNavigator - Showing splash screen (loading)');
    return <SplashScreen />;
  }

  console.log('🎯 AppNavigator - Rendering navigation based on auth state:', {
    isAuthenticated,
    userRole: user?.role,
    navigatingTo: !isAuthenticated ? 'Auth' : user?.role === 'admin' ? 'Admin' : 'Customer'
  });

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="Admin" component={AdminStack} />
        ) : (
          <Stack.Screen name="Customer" component={CustomerStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
