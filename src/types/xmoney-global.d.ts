import {
  ApplePayConfig,
  ApplePayInstance,
} from './xmoney-sdk/apple-pay-sdk.types'
import {
  PaymentCardConfig,
  PaymentCardInstance,
} from './xmoney-sdk/payment-card-sdk.types'
import {
  GooglePayInstance,
  GooglePayConfig,
} from './xmoney-sdk/google-pay-sdk.types'
import {
  PaymentFormConfig,
  PaymentFormInstance,
} from './xmoney-sdk/payment-form-sdk.types'
import { PaymentMethodCapabilities } from './xmoney-sdk/payment-method-capabilities.types'
import {
  SavedCardPaymentInstance,
  XMoneySavedCardPaymentConfig,
} from './xmoney-sdk/saved-card-payment-sdk.types'

declare global {
  interface Window {
    XMoney: {
      paymentForm: (config: PaymentFormConfig) => Promise<PaymentFormInstance>
      paymentCard: (config: PaymentCardConfig) => Promise<PaymentCardInstance>
      savedCardPayment: (
        config: XMoneySavedCardPaymentConfig
      ) => Promise<SavedCardPaymentInstance>
      googlePay: (config: GooglePayConfig) => Promise<GooglePayInstance>
      applePay: (config: ApplePayConfig) => Promise<ApplePayInstance>
      getPaymentMethodCapabilities: () => Promise<PaymentMethodCapabilities>
    }
  }
}
