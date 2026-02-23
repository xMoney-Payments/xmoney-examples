import type {
  ApplePayButtonStyle,
  ApplePayButtonType,
  Locale,
  XMoneyBaseConfig,
  XMoneyBaseInstance,
} from './sdk-base.types'

/**
 * Configuration options for initializing and customizing the XMoney Apple Pay.
 */
export interface XMoneyApplePayConfig extends XMoneyBaseConfig {
  /**
   * Options for customizing the appearance and behavior of Apple Pay.
   */
  options?: {
    /**
     * Locale for the Apple Pay.
     * @defaultValue `"en-US"`
     */
    locale?: Locale

    /**
     * Appearance customization options.
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

/**
 * Represents an instance of the XMoney Apple Pay, providing methods to interact with and manage the payment.
 */
export interface XMoneyApplePayInstance extends XMoneyBaseInstance {}
