
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
				sans: ['Roboto', 'Inter', 'sans-serif'],
				display: ['Roboto', 'sans-serif'],
				mono: ['"JetBrains Mono"', 'monospace'],
				roboto: ['Roboto', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
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
				},
				// Updated retro-inspired color palette
				'datadog': {
					DEFAULT: '#9b87f5',       // Primary purple
					50: '#f5f2ff',
					100: '#ebe4ff',
					200: '#d9ccff',
					300: '#baa6ff',
					400: '#9b87f5',           // Updated primary purple
					500: '#8B5CF6',           // Vivid purple
					600: '#7E69AB',           // Secondary purple
					700: '#6E59A5',           // Tertiary purple
					800: '#5D4A95',
					900: '#4D3A85',
					950: '#3D2A75',
				},
				'dd-blue': {
					DEFAULT: '#33C3F0',       // Sky blue
					50: '#e6f8fd',
					100: '#CCF1FC',
					200: '#99E3F9',
					300: '#66D5F6',
					400: '#33C3F0',           // Sky blue
					500: '#1EAFE0',
					600: '#0D98D0',
					700: '#0081C0',
					800: '#006AB0',
					900: '#0053A0',
				},
				'dd-text': {
					DEFAULT: '#4F4F4F',
					muted: '#7E69AB',         // Secondary purple as text
					light: '#8C8C8C',
					header: '#252525',
				},
				'dd-success': {
					DEFAULT: '#00B887',
					light: '#E7F8F2',
				},
				'dd-warning': {
					DEFAULT: '#F97316',       // Bright orange
					light: '#FFF5E9',
				},
				'dd-error': {
					DEFAULT: '#FF4E4E',
					light: '#FDEEEC',
				},
				'dd-bg': {
					DEFAULT: '#F9FAFB',
					darker: '#f3f4f6',
					card: '#FFFFFF',
				},
				'dd-processing': {
					DEFAULT: '#D946EF',       // Magenta pink
					light: '#F0EEFF',
				},
				// Additional retro colors
				'retro': {
					'pink': '#FFDEE2',        // Soft pink
					'peach': '#FDE1D3',       // Soft peach
					'blue': '#D3E4FD',        // Soft blue
					'gray': '#F1F0FB',        // Soft gray
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse': {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0.5 },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
