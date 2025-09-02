import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { LoginCredentials, RegisterCredentials, User, AuthResponse } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * DEVELOPMENT MODE CONFIGURATION
 * =============================
 * 
 * The following settings are enabled for development:
 * 
 * 1. isAuthenticated() always returns false - forces login screen on every app reload
 * 2. AsyncStorage persistence is disabled - no automatic session restoration
 * 3. Users must login/register every time the app restarts
 * 
 * To enable production mode:
 * - Restore original isAuthenticated() logic
 * - Re-enable AsyncStorage.setItem() calls in login() and register()
 * - Remove development mode comments
 */

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
        if (authError.message === 'Email not confirmed') {
          throw new Error('Please check your email and click the confirmation link, or contact support if you didn\'t receive the email.');
        }
        throw new Error(authError.message);
      }

      console.log('✅ AuthService.login - Supabase auth successful, user ID:', authData.user?.id);

      if (!authData.user) {
        console.error('❌ AuthService.login - No user data returned from Supabase');
        throw new Error('No user data returned');
      }

      // Get user profile
      console.log('🔐 AuthService.login - Fetching user profile...');
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .eq('role', credentials.role)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile not found, try without role filter
        console.log('🔐 AuthService.login - Profile not found with role filter, trying without role...');
        const { data: profileWithoutRole, error: profileError2 } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileWithoutRole) {
          if (profileWithoutRole.role !== credentials.role) {
            console.error('❌ AuthService.login - Role mismatch:', {
              expected: credentials.role,
              actual: profileWithoutRole.role
            });
            throw new Error('Role mismatch. Please use the correct login portal.');
          }
          profile = profileWithoutRole;
          profileError = null;
        } else if (profileError2 && profileError2.code === 'PGRST116') {
          // Profile doesn't exist at all, create it from auth data
          console.log('🔐 AuthService.login - Profile not found, creating from auth data...');
          
          const userMetadata = authData.user.user_metadata || {};
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email || credentials.email,
              full_name: userMetadata.full_name || '',
              phone: userMetadata.phone || '',
              role: credentials.role,
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ AuthService.login - Profile creation error:', createError);
            throw new Error('Account exists but profile setup incomplete. Please contact support.');
          } else {
            profile = newProfile;
            profileError = null;
          }
        } else {
          profileError = profileError2;
        }
      }

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

      // Store in AsyncStorage - DISABLED FOR DEVELOPMENT
      console.log('🔐 AuthService.login - Skipping storage for development mode');
      console.log('🔐 AuthService.login - Would normally store user data in AsyncStorage...');
      // await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      // await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role);
      // await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

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

      // Create auth user with metadata
      console.log('📝 AuthService.register - Creating Supabase auth user with metadata...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name,
            role: credentials.role,
            phone: credentials.phone
          }
        }
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

      // Check if email confirmation is required
      if (!authData.session) {
        console.log('📧 AuthService.register - Email confirmation required');
        // Email confirmation is required - return special response
        return {
          user: null,
          token: '',
          requiresEmailConfirmation: true,
          message: 'Please check your email and click the confirmation link to complete your registration.'
        };
      }

      // Wait a bit for the trigger to execute
      console.log('📝 AuthService.register - Waiting for profile creation...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for auto-created profile with retries
      let profile = null;
      let retries = 5;
      
      while (retries > 0 && !profile) {
        console.log(`📝 AuthService.register - Checking for profile (${retries} retries left)...`);
        
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (existingProfile) {
          console.log('✅ AuthService.register - Profile found via auto-creation or previous attempt');
          profile = existingProfile;
          break;
        }

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('❌ AuthService.register - Error fetching profile:', fetchError);
        }

        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // If still no profile, the user signup succeeded but profile creation failed
      // This means they can still log in later, but we need to handle this gracefully
      if (!profile) {
        console.error('❌ AuthService.register - Profile creation failed after retries');
        throw new Error('Account created but profile setup incomplete. Please try logging in.');
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

      // Store in AsyncStorage - DISABLED FOR DEVELOPMENT
      console.log('📝 AuthService.register - Skipping storage for development mode');
      console.log('📝 AuthService.register - Would normally store user data in AsyncStorage...');
      // await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      // await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role);
      // await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

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
      console.log('🔍 AuthService.isAuthenticated - Development mode: always return false');
      
      // For development: always return false to show login screen
      // This ensures we always see the login/signup page on app reload
      
      console.log('🔍 AuthService.isAuthenticated - Result:', {
        isAuthenticated: false,
        developmentMode: true,
        reason: 'Development mode - always show login screen'
      });
      
      return false;
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
