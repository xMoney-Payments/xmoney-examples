import type { XMoneyPaymentCardConfig } from './payment-card-sdk.types'
import type {
  ApplePayButtonStyle,
  ApplePayButtonType,
  GooglePayButtonBorderType,
  GooglePayButtonColor,
  GooglePayButtonType,
  Locale,
  Theme,
  XMoneyBaseInstance,
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
export interface XMoneyPaymentFormInstance extends XMoneyBaseInstance {
  /**
   * Updates the locale of the payment form.
   *
   * @param locale - Locale to set for the form.
   */
  updateLocale: (locale: Locale) => void

  /**
   * Updates the appearance of the payment form.
   *
   * @param appearance - Theme, CSS variables, and/or CSS rules to apply.
   */
  updateAppearance: (appearance: {
    theme?: Theme
    variables?: Record<string, string>
    rules?: Record<string, Record<string, string>>
  }) => void

  /**
   * Submits the payment.
   */
  submit: () => void

  /**
   * Validates the payment fields and returns the validation result.
   *
   * @returns An object containing the validation status and any errors found.
   */
  validate: () => { isValid: boolean; errors: Record<string, string> }
}
