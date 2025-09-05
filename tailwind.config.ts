import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
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
  			// Construction Industry Specific Colors
  			'construction-yellow': {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				'400': '#fbbf24', // Primary Construction Yellow
  				'500': '#f59e0b', // Accent Yellow
  				'600': '#d97706', // Dark Yellow
  			},
  			'construction-black': {
  				'50': '#f9fafb',
  				'100': '#f3f4f6',
  				'800': '#1f2937', // Primary Dark
  				'900': '#111827', // Deep Black
  				'950': '#030712', // Absolute Black
  			},
  			// Status Colors for Construction
  			'success': '#10b981',
  			'warning': '#f59e0b',
  			'error': '#ef4444',
  			'info': '#3b82f6',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// Construction Industry Specific Animations
  		animation: {
  			'float': 'float 3s ease-in-out infinite',
  			'slide-up': 'slide-up 0.6s ease-out forwards',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  		},
  		// Construction Industry Typography
  		fontFamily: {
  			'construction': ['Inter', 'system-ui', 'sans-serif'],
  		},
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
