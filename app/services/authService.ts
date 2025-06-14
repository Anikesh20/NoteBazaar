import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { User } from '../types/user';

// Storage keys
const AUTH_TOKEN_KEY = 'authToken';
const USER_ID_KEY = 'userId';

// Update this URL to match your actual backend server
// const API_URL = 'http://10.0.2.2:3000/api/auth'; // For Android emulator
// const API_URL = 'http://localhost:3000/api/auth'; // For iOS simulator
// const API_URL = 'http://YOUR_ACTUAL_IP:3000/api/auth'; // For physical device

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone_number?: string;
  emergency_number?: string;
  district?: string;
  current_location?: string;
  blood_group?: string;
  is_volunteer?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface SignupData {
  email: string;
  username: string;
  full_name: string;
  phone_number: string;
  password: string;
  program?: string;
}

// Test account credentials
const TEST_ACCOUNT = {
  email: 'test@gmail.com',
  password: 'test@123',
  user: {
    id: 999,
    email: 'test@gmail.com',
    username: 'testuser',
    full_name: 'Test User',
    phone_number: '9841234567',
    district: 'Kathmandu',
    current_location: 'Kathmandu',
    blood_group: 'O+',
    is_volunteer: false,
  },
  token: 'test_token_123456789'
};

export const authService = {
  signup: async (userData: SignupData): Promise<LoginResponse> => {
    try {
      console.log('Auth Debug - Attempting signup');
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Auth Debug - Signup response:', { status: response.status, success: response.ok });

      if (!response.ok) {
        if (data.error === 'Email already exists') {
          throw new Error('An account with this email already exists');
        } else if (data.error === 'Invalid email format') {
          throw new Error('Please enter a valid email address');
        } else if (data.error === 'Invalid phone number format') {
          throw new Error('Please enter a valid Nepali phone number');
        } else if (data.error === 'Password must be at least 8 characters long') {
          throw new Error('Password must be at least 8 characters long');
        } else if (data.details) {
          throw new Error(data.details);
        } else {
          throw new Error(data.error || 'Signup failed. Please try again.');
        }
      }

      return {
        user: data.user,
        token: data.token,
        message: 'Signup successful'
      };
    } catch (error: any) {
      console.error('Auth Debug - Signup error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and try again.');
      }
      throw error;
    }
  },

  login: async (identifier: string, password: string): Promise<LoginResponse> => {
    try {
      console.log('Auth Debug - Attempting login');
      
      // Check for test account
      if (identifier === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
        console.log('Auth Debug - Test account login successful');
        // Save auth state for test account
        await Promise.all([
          AsyncStorage.setItem(AUTH_TOKEN_KEY, TEST_ACCOUNT.token),
          AsyncStorage.setItem(USER_ID_KEY, String(TEST_ACCOUNT.user.id))
        ]);

        return {
          user: TEST_ACCOUNT.user,
          token: TEST_ACCOUNT.token,
          message: 'Login successful'
        };
      }

      // Regular login flow for other accounts
      const loginUrl = `${API_URL}/api/auth/login`;
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: identifier, password }),
      });

      console.log('Auth Debug - Login response:', { status: response.status, success: response.ok });
      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Invalid email or password') {
          throw new Error('Invalid email or password');
        } else if (data.error === 'Email and password are required') {
          throw new Error('Please enter your email and password');
        } else {
          throw new Error(data.error || 'Login failed. Please try again.');
        }
      }

      // Save auth state immediately after successful login
      console.log('Auth Debug - Saving auth state after login');
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token),
        AsyncStorage.setItem(USER_ID_KEY, String(data.user.id))
      ]);

      return {
        user: data.user,
        token: data.token,
        message: 'Login successful'
      };
    } catch (error: any) {
      console.error('Auth Debug - Login error:', error);
      // Clear any partial auth state on error
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_ID_KEY]);
      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and try again.');
      }
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      console.log('Auth Debug - Getting current user');
      const [userId, token] = await Promise.all([
        AsyncStorage.getItem(USER_ID_KEY),
        AsyncStorage.getItem(AUTH_TOKEN_KEY)
      ]);
      
      console.log('Auth Debug - Stored auth state:', { userId: !!userId, token: !!token });
      
      if (!userId || !token) {
        console.log('Auth Debug - No user ID or token found');
        return null;
      }

      // Check if it's the test account
      if (userId === String(TEST_ACCOUNT.user.id) && token === TEST_ACCOUNT.token) {
        console.log('Auth Debug - Returning test account user data');
        return TEST_ACCOUNT.user;
      }

      // Regular user data fetch for other accounts
      console.log('Auth Debug - Fetching user data from backend');
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('Auth Debug - User data response:', { status: response.status, success: response.ok });

      if (response.status === 401 || response.status === 403) {
        console.log('Auth Debug - Token invalid, expired, or insufficient permissions');
        if (response.status === 401) {
          await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_ID_KEY]);
        }
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      console.log('Auth Debug - User data loaded successfully');
      return userData;
    } catch (error) {
      console.error('Auth Debug - Error getting current user:', error);
      if (error instanceof Error && 
          (error.message === 'Network request failed' || 
           error.message.includes('permission'))) {
        return null;
      }
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_ID_KEY]);
      return null;
    }
  },

  logout: async () => {
    try {
      console.log('Auth Debug - Logging out');
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_ID_KEY]);
      console.log('Auth Debug - Auth state cleared');
    } catch (error) {
      console.error('Auth Debug - Error during logout:', error);
      throw error;
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      console.log('Auth Debug - Getting token');
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      console.log('Auth Debug - Token exists:', !!token);
      return token;
    } catch (error) {
      console.error('Auth Debug - Error getting token:', error);
      return null;
    }
  },
};

export default authService; 