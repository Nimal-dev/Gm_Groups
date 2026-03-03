import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-poppins)', 'sans-serif'],
        headline: ['var(--font-poppins)', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        card: {
          DEFAULT: '#121212',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#121212',
          foreground: '#ffffff',
        },
        primary: {
          DEFAULT: '#facc15', // Neon Yellow
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#1f1f1f',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#1f1f1f',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#facc15', // Neon Yellow
          foreground: '#000000',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: '#27272a',
        input: '#27272a',
        ring: '#facc15',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      boxShadow: {
        neon: '0 0 5px #facc15, 0 0 20px rgba(250, 204, 21, 0.3)',
        'neon-strong': '0 0 10px #facc15, 0 0 40px rgba(250, 204, 21, 0.5)',
        'neon-border': '0 0 0 1px rgba(250, 204, 21, 0.2), 0 0 15px -5px #facc15',
        'neon-border-strong': '0 0 0 1px rgba(250, 204, 21, 0.4), 0 0 25px -5px #facc15',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
