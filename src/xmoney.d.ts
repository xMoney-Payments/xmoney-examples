import type { XMoneyPaymentForm } from './types/xmoney-sdk/payment-form-sdk.types'

declare global {
  interface Window {
    XMoneyPaymentForm: XMoneyPaymentForm
  }
}
