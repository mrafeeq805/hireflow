/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: '#0B8063',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        hireflow: {
          primary: '#0F9D78',
          hover: '#0B8063',
          navy: '#142B3B',
          navyLight: '#1D3D53',
          navyDark: '#0B1822',
          mint: '#D9F5EA',
          bgSecondary: '#F6F8F9',
          card: '#FFFFFF',
          textMain: '#263746',
          textSecondary: '#718096',
          border: '#E5EBEF',
          success: '#15966B',
          warning: '#E6A23C',
          danger: '#DC5B62',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(20, 43, 59, 0.06), 0 1px 2px -1px rgba(20, 43, 59, 0.04)',
        dropdown: '0 4px 12px -2px rgba(20, 43, 59, 0.12), 0 2px 4px -2px rgba(20, 43, 59, 0.08)',
        modal: '0 20px 25px -5px rgba(20, 43, 59, 0.15), 0 8px 10px -6px rgba(20, 43, 59, 0.1)',
      },
    },
  },
  plugins: [],
};
