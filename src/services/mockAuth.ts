// Mock authentication service for testing
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterCredentials, User, AuthResponse } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

class MockAuthService {
  // Mock user data
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'customer@test.com',
      full_name: 'Test Customer',
      phone: '1234567890',
      role: 'customer',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'admin@test.com', 
      full_name: 'Test Admin',
      phone: '0987654321',
      role: 'admin',
      created_at: new Date().toISOString(),
    }
  ];

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user by email and role
    const user = this.mockUsers.find(u => 
      u.email === credentials.email && u.role === credentials.role
    );

    if (!user) {
      throw new Error('Invalid email or role');
    }

    // Mock password validation (accept any password for testing)
    if (credentials.password.length < 3) {
      throw new Error('Invalid password');
    }

    const token = `mock_token_${user.id}_${Date.now()}`;

    // Store in AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    return { user, token };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if user already exists
    const existingUser = this.mockUsers.find(u => u.email === credentials.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const newUser: User = {
      id: `mock_${Date.now()}`,
      email: credentials.email,
      full_name: credentials.full_name,
      phone: credentials.phone,
      role: credentials.role,
      created_at: new Date().toISOString(),
    };

    // Add to mock users
    this.mockUsers.push(newUser);

    const token = `mock_token_${newUser.id}_${Date.now()}`;

    // Store in AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, newUser.role);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));

    return { user: newUser, token };
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_TOKEN,
      STORAGE_KEYS.USER_ROLE,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.CART_ITEMS,
    ]);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      return !!token;
    } catch (error) {
      console.error('Check auth error:', error);
      return false;
    }
  }

  async getUserRole(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
    } catch (error) {
      console.error('Get user role error:', error);
      return null;
    }
  }
}

export const authService = new MockAuthService();
