import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';
import { colors } from '../styles/theme';

export default function DashboardLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    const hideNavigationBar = async () => {
      if (Platform.OS === 'android') {
        try {
          const systemUIManager = await import('../utils/systemUIManager');
          await systemUIManager.default.hideNavigationBar();
          await systemUIManager.default.setImmersiveMode();
        } catch (error) {
          console.error('Error hiding navigation bar:', error);
        }
      }
    };

    hideNavigationBar();
  }, []);

  const handleLogout = async () => {
    try {
      // Import the auth state utility
      const { clearAuthState } = await import('../utils/authState');

      // Clear authentication state
      await clearAuthState();

      // Call the logout function from authService
      await logout();

      // Navigate to login screen
      router.replace('/(auth)/LoginScreen');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Get the status bar height
  const statusBarHeight = Constants.statusBarHeight;

  // Handle back button press only on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = {
        removeEventListener: () => {},
        addEventListener: (eventName: string, handler: () => boolean) => {
          if (eventName === 'hardwareBackPress') {
            const subscription = BackHandler.addEventListener(eventName, () => {
              if (isMenuVisible) {
                setIsMenuVisible(false);
                return true;
              }
              return false;
            });
            return { remove: () => subscription.remove() };
          }
          return { remove: () => {} };
        },
      };

      const subscription = backHandler.addEventListener('hardwareBackPress', () => {
        if (isMenuVisible) {
          setIsMenuVisible(false);
          return true;
        }
        return false;
      });

      return () => subscription.remove();
    }
  }, [isMenuVisible]);

  // Custom header component
  const CustomHeader = ({ route, options }: any) => {
    const showHeader = route.name !== 'index';
    const title = options.title || route.name;

    if (!showHeader) return null;

    return (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (route.name === 'index') {
              setIsMenuVisible(true);
            } else {
              router.back();
            }
          }}
          style={styles.headerButton}
        >
          <Ionicons
            name={route.name === 'index' ? 'menu-outline' : 'arrow-back'}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        {route.name === 'index' && (
          <TouchableOpacity
            onPress={() => router.push('/dashboard/upload')}
            style={styles.headerButton}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          header: (props) => <CustomHeader {...props} />,
          contentStyle: { 
            backgroundColor: colors.background,
            flex: 1,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Edit Profile',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
        <Stack.Screen
          name="my-notes"
          options={{
            title: 'My Notes',
          }}
        />
        <Stack.Screen
          name="browse"
          options={{
            title: 'Browse Notes',
          }}
        />
        <Stack.Screen
          name="upload"
          options={{
            title: 'Upload Note',
          }}
        />
        <Stack.Screen
          name="note-details"
          options={{
            title: 'Note Details',
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: colors.text,
  },
});