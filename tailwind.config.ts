import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // V44: Deep institutional palette
        deep: {
          DEFAULT: '#112E3C',
          50: '#F4F8F6',
          100: '#E6F0EB',
          200: '#D1E0D9',
          300: '#BDD0C6',
          400: '#8FB5A6',
          500: '#5A7E7A',
          600: '#2A4A54',
          700: '#1A3B48',
          800: '#0F2832',
          900: '#112E3C',
          950: '#0B1F28',
        },
        // V44: Primary accent — Teal
        teal: {
          DEFAULT: '#287A89',
          50: '#F0FAFB',
          100: '#D6F0F3',
          200: '#ADE1E8',
          300: '#7ACDD8',
          400: '#4A99A8',
          500: '#287A89',
          600: '#1F6B78',
          700: '#1A5A65',
          800: '#164A53',
          900: '#133D45',
          950: '#0A2A30',
        },
        // V44: Sage green — secondary text & subtle elements
        sage: {
          DEFAULT: '#8FB5A6',
          50: '#F4F8F6',
          100: '#EFF5F2',
          200: '#E6F0EB',
          300: '#D1E0D9',
          400: '#BDD0C6',
          500: '#8FB5A6',
          600: '#6A9A88',
          700: '#4E7D6B',
          800: '#3D6556',
          900: '#2F4F43',
        },
        // V44: Navy (retained for secondary elements)
        navy: {
          DEFAULT: '#1A2B4A',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // V44: Category badge colors
        category: {
          federal: '#1A2B4A',
          state: '#287A89',
          local: '#3D7A6A',
          utility: '#4A99A8',
        },
        // V44: Data freshness
        freshness: {
          live: '#10B981',
          fresh: '#059669',
          stale: '#F59E0B',
          outdated: '#EF4444',
        },
        // Shadcn UI variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        sora: ['var(--font-sora)', 'Sora', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
          '70%': { boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
        },
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'logo-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-ring': 'pulse-ring 2s infinite',
        'ticker-scroll': 'ticker-scroll 90s linear infinite',
        'logo-fade-in': 'logo-fade-in 1.5s ease 0.2s forwards',
        'fade-in-up': 'fade-in-up 0.4s ease forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
