import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { authService, SignupData } from '../services/authService';
import { User } from '../types/user';
import * as authState from '../utils/authState';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    token: null,
  });

  // Load user data and token on mount
  useEffect(() => {
    let mounted = true;

    const loadUserAndToken = async () => {
      try {
        if (!mounted) return;
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Get the stored token and user ID
        const [token, userId] = await Promise.all([
          authState.getAuthToken(),
          authState.getUserId()
        ]);

        console.log('Auth Debug - Loading user and token:', { token: !!token, userId });

        if (!token || !userId) {
          console.log('Auth Debug - No token or userId found');
          if (mounted) {
            setState(prev => ({ ...prev, user: null, token: null, isLoading: false }));
          }
          return;
        }

        // Get user data using the token
        const user = await authService.getCurrentUser();
        console.log('Auth Debug - User data loaded:', !!user);

        if (!user) {
          console.log('Auth Debug - No user data found, clearing auth state');
          // If no user data but we have a token, clear the invalid state
          await authState.clearAuthState();
          if (mounted) {
            setState(prev => ({ ...prev, user: null, token: null, isLoading: false }));
          }
          return;
        }

        // Update state with both user and token
        if (mounted) {
          console.log('Auth Debug - Setting user and token in state');
          setState(prev => ({ ...prev, user, token, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth Debug - Error loading user and token:', error);
        // Only clear auth state on specific errors
        if (error instanceof Error && 
            !error.message.includes('Network request failed')) {
          await authState.clearAuthState();
        }
        if (mounted) {
          setState(prev => ({
            ...prev,
            user: null,
            token: null,
            error: error instanceof Error ? error.message : 'Failed to load user',
            isLoading: false,
          }));
        }
      }
    };

    loadUserAndToken();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  const signUp = useCallback(async (userData: SignupData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await authService.signup(userData);
      
      // Don't save auth state or update user state since we want them to login
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Navigate to login screen instead of dashboard
      router.replace('/(auth)/LoginScreen');
      
      return data; // Return the data so the signup screen can show success message
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Signup failed',
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const signIn = useCallback(async (identifier: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await authService.login(identifier, password);
      
      // Save auth state
      await authState.saveUserAuthState(String(data.user.id), data.token);
      
      // Update user state with both user and token
      setState(prev => ({ 
        ...prev, 
        user: data.user, 
        token: data.token,
        isLoading: false 
      }));
      
      // Navigation is handled in the LoginScreen component
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.logout();
      await authState.clearAuthState();
      setState(prev => ({ ...prev, user: null, token: null, isLoading: false }));
      router.replace('/(auth)/LoginScreen');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    signUp,
    signIn,
    signOut,
  };
}; 