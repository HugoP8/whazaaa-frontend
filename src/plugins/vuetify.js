import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          // WhatsApp Brand Colors - Enhanced
          primary: '#25D366',        // WhatsApp Green
          secondary: '#128C7E',      // WhatsApp Teal
          accent: '#34B7F1',         // WhatsApp Blue

          // Modern Palette
          success: '#00C851',        // Vibrant Green
          warning: '#FF8800',        // Modern Orange
          error: '#FF4444',          // Soft Red
          info: '#33B5E5',          // Light Blue

          // Enhanced Neutrals
          background: '#F8FAFC',     // Ultra light background
          surface: '#FFFFFF',        // Pure white surfaces
          'surface-variant': '#F1F5F9', // Light grey variant
          'on-surface': '#1E293B',   // Dark text
          'surface-bright': '#FFFFFF',

          // Text Colors
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-background': '#1E293B',
          'on-surface-variant': '#64748B',

          // Additional Modern Colors
          grey: '#64748B',
          'grey-lighten-1': '#94A3B8',
          'grey-lighten-2': '#CBD5E1',
          'grey-lighten-3': '#E2E8F0',
          'grey-lighten-4': '#F1F5F9',
          'grey-lighten-5': '#F8FAFC',
          'grey-darken-1': '#475569',
          'grey-darken-2': '#334155',
          'grey-darken-3': '#1E293B',
          'grey-darken-4': '#0F172A',

          // Teal variations for WhatsApp theme
          'teal-lighten-1': '#26A69A',
          'teal-lighten-2': '#4DB6AC',
          'teal-lighten-3': '#80CBC4',
          'teal-lighten-4': '#B2DFDB',
          'teal-lighten-5': '#E0F2F1',
          'teal-darken-1': '#00695C',
          'teal-darken-2': '#004D40',
          'teal-darken-3': '#00251A',

          // Green variations
          'green-lighten-1': '#4CAF50',
          'green-lighten-2': '#81C784',
          'green-lighten-3': '#A5D6A7',
          'green-lighten-4': '#C8E6C9',
          'green-lighten-5': '#E8F5E8',
          'green-darken-1': '#388E3C',
          'green-darken-2': '#2E7D32',
          'green-darken-3': '#1B5E20',
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#25D366',
          secondary: '#128C7E',
          accent: '#34B7F1',

          background: '#0F172A',
          surface: '#1E293B',
          'surface-variant': '#334155',
          'on-surface': '#F8FAFC',

          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      }
    }
  },
  defaults: {
    VCard: {
      elevation: 3,
      rounded: 'xl',
    },
    VBtn: {
      rounded: 'lg',
      variant: 'elevated',
      style: 'text-transform: none; letter-spacing: 0.5px;'
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VChip: {
      rounded: 'lg',
      variant: 'tonal',
    },
    VAlert: {
      rounded: 'lg',
      variant: 'tonal',
    },
    VProgressLinear: {
      rounded: true,
      height: 8,
    },
    VProgressCircular: {
      width: 4,
    },
    VNavigationDrawer: {
      elevation: 8,
    },
    VAppBar: {
      elevation: 4,
    },
    VDataTable: {
      hover: true,
    }
  }
});