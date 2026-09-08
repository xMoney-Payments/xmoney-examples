import type { Appearance } from '@/types/xmoney-sdk/sdk-base.types'

export const VELVET_COLORS = {
  bg: '#F5E6E8',
  bgLight: '#FAF0F2',
  maroon: '#6B2C3E',
  maroonLight: '#8B3A4F',
  text: '#3D1F2A',
  textMuted: '#8B6B73',
  textPlaceholder: '#B8A8AC',
  border: '#E8D4D8',
  inputBg: '#FFF5F6',
  cardBg: '#FFF8F9',
  danger: '#B4234E',
} as const

export const VELVET_EMBEDDED_APPEARANCE: Appearance = {
  theme: 'custom',
  variables: {
    colorPrimary: VELVET_COLORS.maroon,
    colorDanger: VELVET_COLORS.danger,
    colorText: VELVET_COLORS.text,
    colorTextSecondary: VELVET_COLORS.textMuted,
    colorTextPlaceholder: VELVET_COLORS.textPlaceholder,
    colorBorder: VELVET_COLORS.border,
    colorBorderFocus: VELVET_COLORS.maroon,
    colorBackground: VELVET_COLORS.cardBg,
    colorBackgroundInput: '#FFFFFF',
    borderRadius: '12px',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  rules: {
    '.xmoney-label': {
      fontSize: '11px',
      fontWeight: '600',
      color: VELVET_COLORS.maroon,
      marginBottom: '6px',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    '.xmoney-label--focused': {
      color: VELVET_COLORS.maroonLight,
    },
    '.xmoney-input': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: VELVET_COLORS.border,
      backgroundColor: '#FFFFFF',
      padding: '13px 14px',
      fontSize: '15px',
      borderRadius: '12px',
      boxShadow: '0 1px 2px rgba(61, 31, 42, 0.04)',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    },
    '.xmoney-input:hover': {
      borderColor: '#D4C4C8',
    },
    '.xmoney-input:focus': {
      borderColor: VELVET_COLORS.maroon,
      boxShadow: '0 0 0 3px rgba(107, 44, 62, 0.12)',
      outline: 'none',
    },
    '.xmoney-input--invalid': {
      borderColor: VELVET_COLORS.danger,
      boxShadow: '0 0 0 3px rgba(180, 35, 78, 0.1)',
    },
    '.xmoney-input::placeholder': {
      color: VELVET_COLORS.textPlaceholder,
    },
    '.xmoney-card-group': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: VELVET_COLORS.border,
      backgroundColor: '#FFFFFF',
      borderRadius: '14px',
      boxShadow: '0 1px 3px rgba(61, 31, 42, 0.06)',
    },
    '.xmoney-card-group:hover': {
      borderColor: '#D4C4C8',
    },
    '.xmoney-card-group--invalid': {
      borderColor: VELVET_COLORS.danger,
      boxShadow: '0 0 0 3px rgba(180, 35, 78, 0.1)',
    },
    '.xmoney-error': {
      color: VELVET_COLORS.danger,
      fontSize: '12px',
      marginTop: '4px',
    },
  },
}

export const VELVET_WALLET_APPEARANCE = {
  googlePay: {
    color: 'black' as const,
    type: 'pay' as const,
    height: 48,
    radius: 999,
    borderType: 'no_border' as const,
  },
  applePay: {
    style: 'black' as const,
    type: 'pay' as const,
    height: 48,
    radius: 999,
  },
}
