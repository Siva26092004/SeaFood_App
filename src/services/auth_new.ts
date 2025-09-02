import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { LoginCredentials, RegisterCredentials, User, AuthResponse } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService.login - Starting login process', {
        email: credentials.email,
        role: credentials.role,
        timestamp: new Date().toISOString()
      });

      // Authenticate with Supabase
      console.log('🔐 AuthService.login - Authenticating with Supabase...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        console.error('❌ AuthService.login - Supabase auth error:', authError);
        throw new Error(authError.message);
      }

      console.log('✅ AuthService.login - Supabase auth successful, user ID:', authData.user?.id);

      if (!authData.user) {
        console.error('❌ AuthService.login - No user data returned from Supabase');
        throw new Error('No user data returned');
      }

      // Get user profile
      console.log('🔐 AuthService.login - Fetching user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .eq('role', credentials.role)
        .single();

      if (profileError) {
        console.error('❌ AuthService.login - Profile fetch error:', profileError);
        throw new Error('Profile not found or role mismatch');
      }

      console.log('✅ AuthService.login - Profile fetched successfully:', {
        id: profile.id,
        role: profile.role,
        fullName: profile.full_name
      });

      const user: User = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone || '',
        role: profile.role,
        created_at: profile.created_at,
      };

      const token = authData.session?.access_token || '';

      // Store in AsyncStorage
      console.log('🔐 AuthService.login - Storing user data in AsyncStorage...');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      console.log('✅ AuthService.login - Login completed successfully', {
        userId: user.id,
        role: user.role,
        hasToken: !!token
      });

      return { user, token };
    } catch (error: any) {
      console.error('❌ AuthService.login - Login failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('📝 AuthService.register - Starting registration process', {
        email: credentials.email,
        role: credentials.role,
        fullName: credentials.full_name,
        timestamp: new Date().toISOString()
      });

      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        console.error('❌ AuthService.register - Password mismatch');
        throw new Error('Passwords do not match');
      }

      // Create auth user
      console.log('📝 AuthService.register - Creating Supabase auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        console.error('❌ AuthService.register - Supabase auth creation error:', authError);
        throw new Error(authError.message);
      }

      console.log('✅ AuthService.register - Supabase auth user created:', authData.user?.id);

      if (!authData.user) {
        console.error('❌ AuthService.register - No user data returned from Supabase');
        throw new Error('No user data returned');
      }

      // Create profile
      console.log('📝 AuthService.register - Creating user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: credentials.email,
          full_name: credentials.full_name,
          phone: credentials.phone,
          role: credentials.role,
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ AuthService.register - Profile creation error:', profileError);
        throw new Error(profileError.message);
      }

      console.log('✅ AuthService.register - Profile created successfully:', {
        id: profile.id,
        role: profile.role,
        fullName: profile.full_name
      });

      const user: User = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone || '',
        role: profile.role,
        created_at: profile.created_at,
      };

      const token = authData.session?.access_token || '';

      // Store in AsyncStorage
      console.log('📝 AuthService.register - Storing user data in AsyncStorage...');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      console.log('✅ AuthService.register - Registration completed successfully', {
        userId: user.id,
        role: user.role,
        hasToken: !!token
      });

      return { user, token };
    } catch (error: any) {
      console.error('❌ AuthService.register - Registration failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      console.log('🚪 AuthService.logout - Starting logout process');

      // Sign out from Supabase
      console.log('🚪 AuthService.logout - Signing out from Supabase...');
      await supabase.auth.signOut();

      // Clear AsyncStorage
      console.log('🚪 AuthService.logout - Clearing AsyncStorage...');
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_ROLE,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.CART_ITEMS,
      ]);

      console.log('✅ AuthService.logout - Logout completed successfully');
    } catch (error: any) {
      console.error('❌ AuthService.logout - Logout error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Get current user from storage
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('👤 AuthService.getCurrentUser - Fetching current user from storage');
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const user = userData ? JSON.parse(userData) : null;
      
      console.log('👤 AuthService.getCurrentUser - Result:', {
        hasUser: !!user,
        userId: user?.id,
        role: user?.role
      });
      
      return user;
    } catch (error: any) {
      console.error('❌ AuthService.getCurrentUser - Error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      console.log('🔍 AuthService.isAuthenticated - Checking authentication status');
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const isAuth = !!token;
      
      console.log('🔍 AuthService.isAuthenticated - Result:', {
        isAuthenticated: isAuth,
        hasToken: !!token
      });
      
      return isAuth;
    } catch (error: any) {
      console.error('❌ AuthService.isAuthenticated - Error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  // Get user role
  async getUserRole(): Promise<string | null> {
    try {
      console.log('🔍 AuthService.getUserRole - Fetching user role from storage');
      const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
      
      console.log('🔍 AuthService.getUserRole - Result:', { role });
      
      return role;
    } catch (error: any) {
      console.error('❌ AuthService.getUserRole - Error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }
}

export const authService = new AuthService();
