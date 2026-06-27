import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        background: '#04060D',
        card: 'rgba(10,16,30,0.7)',
        panel: 'rgba(15,24,44,0.6)',
        border: 'rgba(255,255,255,0.07)',
        'border-lit': 'rgba(255,255,255,0.13)',
        blue: { DEFAULT: '#3B82F6', dim: 'rgba(59,130,246,0.15)', glow: 'rgba(59,130,246,0.08)' },
        green: { DEFAULT: '#10B981', dim: 'rgba(16,185,129,0.12)' },
        red: { DEFAULT: '#EF4444', dim: 'rgba(239,68,68,0.12)' },
        yellow: { DEFAULT: '#F59E0B', dim: 'rgba(245,158,11,0.12)' },
        't1': '#F0F4FF',
        't2': '#8899BB',
        't3': '#3D5280',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        'grid': 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
      },
      backdropBlur: { glass: '20px' },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.15)',
        'glow-green': '0 0 14px rgba(16,185,129,0.2)',
      },
      borderRadius: { xl2: '16px', xl3: '20px' },
      animation: {
        'fade-in': 'fadeIn 0.25s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
    },
  },
  plugins: [],
}
export default config
