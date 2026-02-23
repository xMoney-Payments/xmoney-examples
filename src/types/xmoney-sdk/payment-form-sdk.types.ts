import type {
  XMoneyPaymentCardConfig,
  XMoneyPaymentCardInstance,
} from './payment-card-sdk.types'
import type {
  ApplePayButtonStyle,
  ApplePayButtonType,
  GooglePayButtonBorderType,
  GooglePayButtonColor,
  GooglePayButtonType,
} from './sdk-base.types'

/**
 * Configuration options for initializing and customizing the xMoney payment form.
 */
export interface XMoneyPaymentFormConfig extends XMoneyPaymentCardConfig {
  paymentMethods?: {
    /**
     * Configuration for google payment methods.
     */
    googlePay?: {
      /**
       * Enables Google Pay as a payment option.
       *
       * @defaultValue `false`
       */
      enabled?: boolean
      /**
       * Appearance customization for Google Pay button.
       */
      appearance?: {
        /**
         * Style of the Google Pay button.
         *
         * @defaultValue `"black"` when theme is light, `"white"` when theme is dark
         */
        color?: GooglePayButtonColor
        /**
         * Corner radius of the Google Pay button.
         * @defaultValue `12`
         */
        radius?: number
        /**
         *  Type of the Google Pay button.
         * @defaultValue `"pay"`
         */
        type?: GooglePayButtonType
        /**
         * Border type of the Google Pay button.
         * @defaultValue `"no_border"`
         */
        borderType?: GooglePayButtonBorderType
      }
    }
    /**
     * Configuration for apple payment methods.
     */
    applePay?: {
      /**
       * Enables Apple Pay as a payment option.
       *
       * @defaultValue `false`
       */
      enabled?: boolean
      /**
       * Appearance customization for Apple Pay button.
       */
      appearance?: {
        /**
         * Style of the Apple Pay button.
         * @defaultValue `"black"` when theme is light, `"white"` when theme is dark
         */
        style?: ApplePayButtonStyle
        /**
         * Corner radius of the Apple Pay button.
         * @defaultValue `12`
         */
        radius?: number
        /**
         * Type of the Apple Pay button.
         * @defaultValue `"pay"`
         */
        type?: ApplePayButtonType
      }
    }
  }
}

/**
 * Represents an instance of the XMoney payment form, providing methods to interact with and manage the form.
 */
export interface XMoneyPaymentFormInstance extends XMoneyPaymentCardInstance {}
