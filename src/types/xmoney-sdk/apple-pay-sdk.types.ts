import type { XMoneyBaseConfig, XMoneyBaseInstance } from './sdk-base.types'

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
    locale?: 'en-US' | 'el-GR' | 'ro-RO'

    /**
     * Appearance customization options.
     */
    appearance?: {
      /**
       * Style of the Apple Pay button.
       * @defaultValue `"black"` when theme is light, `"white"` when theme is dark
       */
      style?: 'white' | 'black' | 'white-outline'
      /**
       * Corner radius of the Apple Pay button.
       * @defaultValue `12`
       */
      radius?: number
      /**
       * Type of the Apple Pay button.
       * @defaultValue `"pay"`
       */
      type?:
        | 'add-money'
        | 'book'
        | 'buy'
        | 'checkout'
        | 'contribute'
        | 'continue'
        | 'donate'
        | 'order'
        | 'plain'
        | 'pay'
        | 'reload'
        | 'rent'
        | 'set-up'
        | 'subscribe'
        | 'support'
        | 'tip'
        | 'top-up'
    }
  }
}

/**
 * Represents an instance of the XMoney Apple Pay, providing methods to interact with and manage the payment.
 */
export interface XMoneyApplePayInstance extends XMoneyBaseInstance {}
