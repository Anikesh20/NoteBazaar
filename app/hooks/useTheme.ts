import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem('themeMode');
      if (savedThemeMode) {
        setThemeMode(savedThemeMode as ThemeMode);
      }
    } catch (err) {
      console.error('Failed to load theme preference:', err);
    }
  };

  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setThemeMode(mode);
    } catch (err) {
      console.error('Failed to save theme preference:', err);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const newMode = isDark ? 'light' : 'dark';
    await setTheme(newMode);
  }, [isDark, setTheme]);

  const colors = {
    // Light theme colors
    light: {
      primary: '#007AFF',
      secondary: '#5856D6',
      background: '#FFFFFF',
      card: '#F2F2F7',
      text: '#000000',
      border: '#C6C6C8',
      notification: '#FF3B30',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#5856D6',
      placeholder: '#8E8E93',
      disabled: '#C7C7CC',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    // Dark theme colors
    dark: {
      primary: '#0A84FF',
      secondary: '#5E5CE6',
      background: '#000000',
      card: '#1C1C1E',
      text: '#FFFFFF',
      border: '#38383A',
      notification: '#FF453A',
      success: '#32D74B',
      warning: '#FF9F0A',
      error: '#FF453A',
      info: '#5E5CE6',
      placeholder: '#8E8E93',
      disabled: '#3A3A3C',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  };

  const currentColors = isDark ? colors.dark : colors.light;

  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };

  const typography = {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 36,
      xxxl: 40,
    },
  };

  const shadows = {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  };

  const borderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    round: 9999,
  };

  return {
    isDark,
    themeMode,
    setTheme,
    toggleTheme,
    colors: currentColors,
    spacing,
    typography,
    shadows,
    borderRadius,
  };
}; 