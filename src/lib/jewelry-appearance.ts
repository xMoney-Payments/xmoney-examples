import type { Appearance } from '@/types/xmoney-sdk/sdk-base.types'

export const JEWELRY_COLORS = {
  ultramarine: '#120A8F',
  ultramarineMid: '#283593',
  ultramarineLight: '#3949AB',
  periwinkle: '#7986CB',
  ice: '#E8EAF6',
  mist: '#C5CAE9',
  pearl: '#F5F7FF',
  navy: '#0D1B4B',
  textMuted: '#5C6BC0',
  textPlaceholder: '#9FA8DA',
  border: '#C5CAE9',
  gold: '#C9A962',
  danger: '#B4234E',
} as const

export const JEWELRY_EMBEDDED_APPEARANCE: Appearance = {
  theme: 'custom',
  variables: {
    colorPrimary: JEWELRY_COLORS.ultramarine,
    colorDanger: JEWELRY_COLORS.danger,
    colorText: JEWELRY_COLORS.navy,
    colorTextSecondary: JEWELRY_COLORS.textMuted,
    colorTextPlaceholder: JEWELRY_COLORS.textPlaceholder,
    colorBorder: JEWELRY_COLORS.border,
    colorBorderFocus: JEWELRY_COLORS.ultramarine,
    colorBackground: JEWELRY_COLORS.pearl,
    colorBackgroundInput: '#FFFFFF',
    borderRadius: '8px',
    fontFamily:
      "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  rules: {
    '.xmoney-label': {
      fontSize: '13px',
      fontWeight: '500',
      color: JEWELRY_COLORS.navy,
      marginBottom: '6px',
      letterSpacing: '0.02em',
    },
    '.xmoney-label--focused': {
      color: JEWELRY_COLORS.ultramarine,
    },
    '.xmoney-input': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: JEWELRY_COLORS.border,
      backgroundColor: '#FFFFFF',
      padding: '11px 12px',
      fontSize: '15px',
      borderRadius: '6px',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    },
    '.xmoney-input:hover': {
      borderColor: JEWELRY_COLORS.periwinkle,
    },
    '.xmoney-input:focus': {
      borderColor: JEWELRY_COLORS.ultramarine,
      boxShadow: '0 0 0 3px rgba(18, 10, 143, 0.12)',
      outline: 'none',
    },
    '.xmoney-input--invalid': {
      borderColor: JEWELRY_COLORS.danger,
      boxShadow: '0 0 0 3px rgba(180, 35, 78, 0.1)',
    },
    '.xmoney-input::placeholder': {
      color: JEWELRY_COLORS.textPlaceholder,
    },
    '.xmoney-card-group': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: JEWELRY_COLORS.border,
      backgroundColor: '#FFFFFF',
      borderRadius: '10px',
    },
    '.xmoney-card-group:hover': {
      borderColor: JEWELRY_COLORS.periwinkle,
    },
    '.xmoney-card-group--invalid': {
      borderColor: JEWELRY_COLORS.danger,
      boxShadow: '0 0 0 3px rgba(180, 35, 78, 0.1)',
    },
    '.xmoney-error': {
      color: JEWELRY_COLORS.danger,
      fontSize: '12px',
      marginTop: '4px',
    },
  },
}

export const JEWELRY_WALLET_APPEARANCE = {
  googlePay: {
    color: 'black' as const,
    type: 'pay' as const,
    height: 48,
    radius: 14,
    borderType: 'no_border' as const,
  },
  applePay: {
    style: 'black' as const,
    type: 'pay' as const,
    height: 48,
    radius: 14,
  },
}
