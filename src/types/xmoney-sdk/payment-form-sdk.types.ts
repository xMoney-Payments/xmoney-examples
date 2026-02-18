import type { CardHolderVerificationResult } from '../checkout-types'
import type { XMoneyBaseConfig, XMoneyBaseInstance } from './sdk-base.types'

/**
 * Configuration options for initializing and customizing the xMoney payment form.
 */
export interface XMoneyPaymentFormConfig extends XMoneyBaseConfig {
  /**
   * Options for customizing the appearance and behavior of form elements.
   */
  options?: {
    /**
     * Appearance customization options.
     */
    appearance?: {
      /**
       * Theme for the payment form.
       *
       * @defaultValue `"light"`
       */
      theme?: 'light' | 'dark' | 'custom'

      /**
       * CSS variables for custom themes.
       *
       * @example { colorPrimary: "#009688" }
       */
      variables?: Record<string, string>

      /**
       * CSS rules for custom styles.
       *
       * @example { ".xmoney-input:hover": { "color": "#333" } }
       */
      rules?: Record<string, Record<string, string>>
    }
    /**
     * Type of the button displayed on the payment form.
     * @defaultValue `"pay"`
     */
    buttonType?:
      | 'book'
      | 'buy'
      | 'checkout'
      | 'donate'
      | 'order'
      | 'pay'
      | 'subscribe'
      | 'topUp'
    /**
     * Validation mode for the form.
     *
     * @defaultValue `"onChange"`
     */
    validationMode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched'

    /**
     * Locale for the payment form.
     *
     * @defaultValue `"en-US"`
     */
    locale?: 'en-US' | 'el-GR' | 'ro-RO'

    /**
     * Enables saved card functionality for returning users.
     *
     * @defaultValue `true`
     */
    enableSavedCards?: boolean

    /**
     * Enables background data refresh for the payment form.
     *
     * @defaultValue `true`
     */
    enableBackgroundRefresh?: boolean

    /**
     * Displays a "Save Card" option to the user.
     *
     * @defaultValue `true`
     */
    displaySaveCardOption?: boolean

    /**
     * Displays the submit button in the form.
     *
     * @defaultValue `true`
     */
    displaySubmitButton?: boolean
    /**
     * Card holder verification options.
     */
    cardHolderVerification?: {
      /**
       * Name information for card holder verification.
       */
      name: {
        firstName: string
        middleName: string
        lastName: string
      }
      /**
       * Callback function for cardholder verification.
       */
      onCardHolderVerification: (
        verificationResult: CardHolderVerificationResult
      ) => boolean
    }
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
   * Callback executed when the form submission state changes.
   *
   * @param isPending - `true` if the form is submitting, `false` otherwise.
   */
  onSubmitPending?: (isPending: boolean) => void
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
  updateLocale: (locale: 'en-US' | 'el-GR' | 'ro-RO') => void

  /**
   * Updates the appearance of the payment form.
   *
   * @param appearance - Theme, CSS variables, and/or CSS rules to apply.
   */
  updateAppearance: (appearance: {
    theme?: 'light' | 'dark' | 'custom'
    variables?: Record<string, string>
    rules?: Record<string, Record<string, string>>
  }) => void

  /**
   * Submits the payment form.
   */
  submit: () => void
}

export interface XMoneyPaymentForm {
  /**
   * Creates and initializes a new payment form instance.
   *
   * @param config - The configuration object required to initialize the payment form.
   * @returns An initialized {@link XMoneyPaymentFormInstance}.
   */
  new (config: XMoneyPaymentFormConfig): XMoneyPaymentFormInstance
}
