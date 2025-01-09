export type ThemeType = 'light' | 'dark'

export const themes = {
	light: {
		colors: {
			primary: {
				50: '#eef2ff',
				100: '#e0e7ff',
				200: '#c7d2fe',
				300: '#a5b4fc',
				400: '#818cf8',
				500: '#6366f1',
				600: '#4f46e5',
				700: '#4338ca',
				800: '#3730a3',
				900: '#312e81',
				950: '#1e1b4b',
			},
			background: {
				primary: '#ffffff',
				secondary: '#f9fafb',
				gradient: {
					from: '#f3f4f6',
					to: '#f9fafb',
				},
			},
			text: {
				primary: '#111827',
				secondary: '#374151',
				muted: '#6b7280',
			},
			border: {
				primary: '#e5e7eb',
				secondary: '#f3f4f6',
			},
		},
	},
	dark: {
		colors: {
			primary: {
				50: '#eef2ff',
				100: '#e0e7ff',
				200: '#c7d2fe',
				300: '#a5b4fc',
				400: '#818cf8',
				500: '#6366f1',
				600: '#4f46e5',
				700: '#4338ca',
				800: '#3730a3',
				900: '#312e81',
				950: '#1e1b4b',
			},
			background: {
				primary: '#111827',
				secondary: '#1f2937',
				gradient: {
					from: '#111827',
					to: '#1f2937',
				},
			},
			text: {
				primary: '#f9fafb',
				secondary: '#e5e7eb',
				muted: '#9ca3af',
			},
			border: {
				primary: '#374151',
				secondary: '#1f2937',
			},
		},
	},
}
