import type { XMoneyBaseConfig, XMoneyBaseInstance } from './sdk-base.types'

/**
 * Configuration options for initializing and customizing the XMoney Google Pay button.
 */
export interface XMoneyGooglePayConfig extends XMoneyBaseConfig {
  /**
   * Options for customizing the appearance and behavior of Google Pay.
   */
  options?: {
    /**
     * Locale for the Google Pay.
     * @defaultValue `"en-US"`
     */
    locale?: 'en-US' | 'el-GR' | 'ro-RO'
    /**
     * Appearance customization options.
     */
    appearance?: {
      /**
       * Color of the Google Pay button.
       *
       * @defaultValue `"black"` when theme is light, `"white"` when theme is dark
       */
      color?: 'white' | 'black'
      /**
       * Corner radius of the Google Pay button.
       * @defaultValue `12`
       */
      radius?: number
      /**
       *  Type of the Google Pay button.
       * @defaultValue `"pay"`
       */
      type?:
        | 'book'
        | 'buy'
        | 'checkout'
        | 'donate'
        | 'order'
        | 'plain'
        | 'pay'
        | 'subscribe'
      /**
       * Border type of the Google Pay button.
       * @defaultValue `"no_border"`
       */
      borderType?: 'default_border' | 'no_border'
    }
  }
}

/**
 * Represents an instance of the xMoney Google Pay, providing methods to interact with and manage the payment.
 */
export interface XMoneyGooglePayInstance extends XMoneyBaseInstance {}
