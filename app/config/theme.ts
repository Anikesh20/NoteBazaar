// NoteBazaar theme (light mode) – modern, clear, smooth, and dynamic

export const colors = {
  primary: '#4A6CF7', // A vibrant blue (for buttons, links, etc.)
  secondary: '#6C5CE7', // A soft purple (for secondary actions, accents)
  tertiary: '#A8A4FF', // A light purple (for tertiary actions, borders, etc.)
  background: '#FFFFFF', // White (main background)
  surface: '#F8F9FA', // Off-white (for cards, modals, etc.)
  text: {
    primary: '#1A1A1A', // Almost black (for headings, primary text)
    secondary: '#6C757D', // Gray (for secondary text, hints, etc.)
    tertiary: '#A0A0A0', // Light gray (for tertiary text, disabled, etc.)
  },
  error: '#FF4D4F', // Red (for errors, alerts, etc.)
  success: '#52C41A', // Green (for success messages, etc.)
  warning: '#FAAD14', // Amber (for warnings, etc.)
  info: '#1890FF', // Blue (for info messages, etc.)
  border: '#E0E0E0', // Light gray (for borders, dividers, etc.)
  overlay: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay (for modals, etc.)
};

export const typography = {
  fontFamily: "'Inter', sans-serif", // Modern, clean font
  h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
  h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4 },
  h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
  button: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5, textTransform: 'uppercase' },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
};

export const transitions = {
  fast: '0.2s ease',
  medium: '0.3s ease',
  slow: '0.5s ease',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
};

export const zIndex = {
  modal: 1000,
  overlay: 900,
  dropdown: 800,
  header: 700,
  footer: 600,
}; 