import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // === COLORS === //
      colors: {
        // shadcn/ui compatibility
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },

        // Modern Design System Colors
        'brand-blue': {
          50: 'var(--color-primary-blue-50)',
          100: 'var(--color-primary-blue-100)',
          200: 'var(--color-primary-blue-200)',
          300: 'var(--color-primary-blue-300)',
          400: 'var(--color-primary-blue-400)',
          500: 'var(--color-primary-blue-500)',
          600: 'var(--color-primary-blue-600)',
          700: 'var(--color-primary-blue-700)',
          800: 'var(--color-primary-blue-800)',
          900: 'var(--color-primary-blue-900)',
          950: 'var(--color-primary-blue-950)',
          DEFAULT: 'var(--color-primary-blue)',
        },
        'brand-orange': {
          50: 'var(--color-primary-orange-50)',
          100: 'var(--color-primary-orange-100)',
          200: 'var(--color-primary-orange-200)',
          300: 'var(--color-primary-orange-300)',
          400: 'var(--color-primary-orange-400)',
          500: 'var(--color-primary-orange-500)',
          600: 'var(--color-primary-orange-600)',
          700: 'var(--color-primary-orange-700)',
          800: 'var(--color-primary-orange-800)',
          900: 'var(--color-primary-orange-900)',
          950: 'var(--color-primary-orange-950)',
          DEFAULT: 'var(--color-primary-orange)',
        },
        'brand-gray': {
          50: 'var(--color-primary-gray-50)',
          100: 'var(--color-primary-gray-100)',
          200: 'var(--color-primary-gray-200)',
          300: 'var(--color-primary-gray-300)',
          400: 'var(--color-primary-gray-400)',
          500: 'var(--color-primary-gray-500)',
          600: 'var(--color-primary-gray-600)',
          700: 'var(--color-primary-gray-700)',
          800: 'var(--color-primary-gray-800)',
          900: 'var(--color-primary-gray-900)',
          950: 'var(--color-primary-gray-950)',
          DEFAULT: 'var(--color-primary-gray)',
        },
        'success': {
          50: 'var(--color-accent-green-50)',
          100: 'var(--color-accent-green-100)',
          200: 'var(--color-accent-green-200)',
          300: 'var(--color-accent-green-300)',
          400: 'var(--color-accent-green-400)',
          500: 'var(--color-accent-green-500)',
          600: 'var(--color-accent-green-600)',
          700: 'var(--color-accent-green-700)',
          800: 'var(--color-accent-green-800)',
          900: 'var(--color-accent-green-900)',
          950: 'var(--color-accent-green-950)',
          DEFAULT: 'var(--color-success)',
        },
        'warning': {
          50: 'var(--color-accent-yellow-50)',
          100: 'var(--color-accent-yellow-100)',
          200: 'var(--color-accent-yellow-200)',
          300: 'var(--color-accent-yellow-300)',
          400: 'var(--color-accent-yellow-400)',
          500: 'var(--color-accent-yellow-500)',
          600: 'var(--color-accent-yellow-600)',
          700: 'var(--color-accent-yellow-700)',
          800: 'var(--color-accent-yellow-800)',
          900: 'var(--color-accent-yellow-900)',
          950: 'var(--color-accent-yellow-950)',
          DEFAULT: 'var(--color-warning)',
        },
        'error': {
          DEFAULT: 'var(--color-error)',
          light: 'var(--color-error-light)',
          dark: 'var(--color-error-dark)',
        },
        'info': {
          DEFAULT: 'var(--color-info)',
          light: 'var(--color-info-light)',
          dark: 'var(--color-info-dark)',
        },
      },

      // === TYPOGRAPHY === //
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        primary: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        // Legacy support
        construction: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
        '6xl': 'var(--text-6xl)',
        '7xl': 'var(--text-7xl)',
        '8xl': 'var(--text-8xl)',
        '9xl': 'var(--text-9xl)',
      },
      fontWeight: {
        thin: 'var(--font-thin)',
        extralight: 'var(--font-extralight)',
        light: 'var(--font-light)',
        normal: 'var(--font-normal)',
        medium: 'var(--font-medium)',
        semibold: 'var(--font-semibold)',
        bold: 'var(--font-bold)',
        extrabold: 'var(--font-extrabold)',
        black: 'var(--font-black)',
      },
      lineHeight: {
        none: 'var(--leading-none)',
        tight: 'var(--leading-tight)',
        snug: 'var(--leading-snug)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
        loose: 'var(--leading-loose)',
      },
      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight: 'var(--tracking-tight)',
        normal: 'var(--tracking-normal)',
        wide: 'var(--tracking-wide)',
        wider: 'var(--tracking-wider)',
        widest: 'var(--tracking-widest)',
      },

      // === SPACING === //
      spacing: {
        '0': 'var(--space-0)',
        'px': 'var(--space-px)',
        '0.5': 'var(--space-0-5)',
        '1': 'var(--space-1)',
        '1.5': 'var(--space-1-5)',
        '2': 'var(--space-2)',
        '2.5': 'var(--space-2-5)',
        '3': 'var(--space-3)',
        '3.5': 'var(--space-3-5)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '7': 'var(--space-7)',
        '8': 'var(--space-8)',
        '9': 'var(--space-9)',
        '10': 'var(--space-10)',
        '11': 'var(--space-11)',
        '12': 'var(--space-12)',
        '14': 'var(--space-14)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '28': 'var(--space-28)',
        '32': 'var(--space-32)',
        '36': 'var(--space-36)',
        '40': 'var(--space-40)',
        '44': 'var(--space-44)',
        '48': 'var(--space-48)',
        '52': 'var(--space-52)',
        '56': 'var(--space-56)',
        '60': 'var(--space-60)',
        '64': 'var(--space-64)',
        '72': 'var(--space-72)',
        '80': 'var(--space-80)',
        '96': 'var(--space-96)',
      },

      // === SHADOWS === //
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
        none: 'var(--shadow-none)',
        // Modern effects
        glass: 'var(--shadow-glass)',
        'glass-lg': 'var(--shadow-glass-lg)',
        'glass-xl': 'var(--shadow-glass-xl)',
        neomorphic: 'var(--shadow-neomorphic)',
        'neomorphic-inset': 'var(--shadow-neomorphic-inset)',
      },

      // === BORDER RADIUS === //
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },

      // === BACKDROP FILTERS === //
      backdropBlur: {
        none: 'var(--backdrop-blur-none)',
        sm: 'var(--backdrop-blur-sm)',
        DEFAULT: 'var(--backdrop-blur-md)',
        md: 'var(--backdrop-blur-md)',
        lg: 'var(--backdrop-blur-lg)',
        xl: 'var(--backdrop-blur-xl)',
        '2xl': 'var(--backdrop-blur-2xl)',
        '3xl': 'var(--backdrop-blur-3xl)',
      },

      // === TRANSITIONS === //
      transitionTimingFunction: {
        'in-out-back': 'var(--ease-in-out-back)',
        'in-out-circ': 'var(--ease-in-out-circ)',
        'in-out-expo': 'var(--ease-in-out-expo)',
        'spring': 'var(--ease-spring)',
      },

      // === ANIMATIONS === //
      animation: {
        // Legacy animations
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        
        // Modern animations
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.4s ease-out forwards',
        'bounce-in': 'bounce-in 0.6s ease-out forwards',
        'glass-morph': 'glass-morph 0.3s ease-out forwards',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },

      // === KEYFRAMES === //
      keyframes: {
        // Legacy keyframes
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
        
        // Modern keyframes
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glass-morph': {
          '0%': { 
            backdropFilter: 'blur(0px)',
            background: 'rgba(255, 255, 255, 0)',
          },
          '100%': { 
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.1)',
          },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },

      // === GRADIENTS === //
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-glass': 'var(--gradient-glass)',
        'gradient-glass-dark': 'var(--gradient-glass-dark)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
