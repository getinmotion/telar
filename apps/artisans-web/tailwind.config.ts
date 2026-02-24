
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
		fontFamily: {
			sans: ['Open Sans', 'system-ui', 'sans-serif'],
			display: ['League Spartan', 'Arial', 'sans-serif'],
			heading: ['League Spartan', 'Arial', 'sans-serif'],
			body: ['Open Sans', 'system-ui', 'sans-serif'],
			artisan: ['League Spartan', 'Arial', 'sans-serif']
		},
			colors: {
				border: 'hsl(var(--border))',
				
				// Navy Blue Palette (Primary)
				'navy': {
					50: 'hsl(220 50% 98%)',
					100: 'hsl(220 50% 95%)',
					200: 'hsl(220 50% 85%)',
					300: 'hsl(220 50% 70%)',
					400: 'hsl(220 50% 50%)',
					500: 'hsl(220 50% 35%)',
					600: 'hsl(220 50% 25%)',
					700: 'hsl(220 50% 15%)', // #142239 - Base
					800: 'hsl(220 50% 10%)',
					900: 'hsl(220 50% 5%)',
					DEFAULT: 'hsl(220 50% 15%)'
				},
				
				// Golden Yellow Palette (Secondary)
				'golden': {
					50: 'hsl(45 100% 95%)',
					100: 'hsl(45 100% 88%)',
					200: 'hsl(45 100% 78%)',
					300: 'hsl(45 100% 68%)',
					400: 'hsl(45 100% 58%)',
					500: 'hsl(45 100% 54%)', // #ffc716 - Base
					600: 'hsl(45 95% 48%)',
					700: 'hsl(45 90% 42%)',
					800: 'hsl(45 85% 35%)',
					900: 'hsl(45 80% 28%)',
					DEFAULT: 'hsl(45 100% 54%)'
				},
				
				// Coral/Peach Palette (Accent)
				'coral': {
					50: 'hsl(20 89% 95%)',
					100: 'hsl(20 89% 88%)',
					200: 'hsl(20 89% 78%)',
					300: 'hsl(20 89% 70%)',
					400: 'hsl(20 89% 66%)', // #f48c5f - Base
					500: 'hsl(20 89% 60%)',
					600: 'hsl(20 85% 52%)',
					700: 'hsl(20 80% 45%)',
					800: 'hsl(20 75% 38%)',
					900: 'hsl(20 70% 30%)',
					DEFAULT: 'hsl(20 89% 66%)'
				},
				
				// Cream Palette (Background)
				'cream': {
					50: 'hsl(40 50% 99%)',
					100: 'hsl(40 50% 98%)', // #fcf7ec - Base
					200: 'hsl(40 45% 94%)',
					300: 'hsl(40 40% 88%)',
					400: 'hsl(40 35% 82%)',
					500: 'hsl(40 30% 75%)',
					DEFAULT: 'hsl(40 50% 98%)'
				},
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				'neon-green': {
					DEFAULT: '#B8FF5C',
					50: '#F4FFED',
					100: '#E8FFD9',
					200: '#D5FFB3',
					300: '#C4FF8D',
					400: '#B8FF5C',
					500: '#A3F03C',
					600: '#8BD91F',
					700: '#6FB016',
					800: '#538510',
					900: '#3A5E0B'
				},
				'deep-green': {
					DEFAULT: '#0C1A12',
					50: '#E8F0EC',
					100: '#D1E1D9',
					200: '#A3C3B3',
					300: '#75A58D',
					400: '#478767',
					500: '#1A6941',
					600: '#145434',
					700: '#0F3F27',
					800: '#0C1A12',
					900: '#06100B'
				},
				'warm-white': '#F8F8F3',
				'soft-gray': '#EAEAEA',
				charcoal: '#121212',
				'neumorphic': {
					surface: 'hsl(var(--neumorphic-surface))',
					light: 'hsl(0 0% 100% / 0.8)',
					dark: 'hsl(220 50% 15% / 0.12)'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
					subtle: 'hsl(var(--primary-subtle))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					glow: 'hsl(var(--secondary-glow))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'soft-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 0 0 hsl(var(--success) / 0.2)' 
					},
					'50%': { 
						boxShadow: '0 0 12px 4px hsl(var(--success) / 0.25)' 
					},
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(184, 255, 92, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(184, 255, 92, 0.6)' }
				},
				'glow-pulse-intense': {
					'0%, 100%': { boxShadow: '0 0 30px rgba(184, 255, 92, 0.5), 0 0 60px rgba(184, 255, 92, 0.3)' },
					'50%': { boxShadow: '0 0 50px rgba(184, 255, 92, 0.8), 0 0 80px rgba(184, 255, 92, 0.5)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-4px)' }
				},
				'scale-bounce': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'soft-glow': 'soft-glow 3s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 15s ease infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'glow-pulse-intense': 'glow-pulse-intense 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'scale-bounce': 'scale-bounce 0.3s ease-out',
				'shimmer': 'shimmer 2s linear infinite',
				'slide-up': 'slide-up 0.4s ease-out'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-primary': 'linear-gradient(135deg, hsl(220 50% 15%), hsl(220 45% 25%))',
				'gradient-secondary': 'linear-gradient(135deg, hsl(45 100% 54%), hsl(45 95% 64%))',
				'gradient-accent': 'linear-gradient(135deg, hsl(20 89% 66%), hsl(45 100% 54%))',
				'gradient-hero': 'linear-gradient(135deg, hsl(220 50% 15% / 0.9), hsl(45 100% 54% / 0.8))',
				'gradient-warm': 'linear-gradient(135deg, hsl(20 89% 66%), hsl(40 50% 98%))',
				'gradient-brand': 'linear-gradient(135deg, hsl(220 50% 15%), hsl(45 100% 54%), hsl(20 89% 66%))',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-glass': 'var(--gradient-glass)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)',
				'hover': 'var(--shadow-hover)',
				'glass': 'var(--shadow-glass)',
				'soft': 'var(--shadow-soft)',
				'neon': '0 0 20px rgba(184, 255, 92, 0.4), 0 0 40px rgba(184, 255, 92, 0.2)',
				'float': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
				'glow-intense': '0 0 30px rgba(184, 255, 92, 0.6), 0 0 60px rgba(184, 255, 92, 0.3)',
				'neumorphic': 'var(--shadow-neumorphic)',
				'neumorphic-hover': 'var(--shadow-neumorphic-hover)',
				'neumorphic-inset': 'var(--shadow-neumorphic-inset)',
				'neumorphic-pressed': 'var(--shadow-neumorphic-pressed)'
			},
			backdropBlur: {
				'glass': '20px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
