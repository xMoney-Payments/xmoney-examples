import type { CardHolderVerificationResult } from '../checkout.types'
import type { XMoneyBaseConfig, XMoneyBaseInstance } from './sdk-base.types'

/**
 * Configuration options for initializing and customizing the xMoney Payment Card element.
 */
export interface XMoneyPaymentCardConfig extends XMoneyBaseConfig {
  card?: {
    /**
     * Validation mode for the form.
     *
     * @defaultValue `"onChange"`
     */
    validationMode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched'
    /**
     * Options for displaying saved cards for returning users.
     */
    savedCards?: {
      /**
       * Enables the display of saved cards for returning users.
       *
       * @defaultValue `true`
       */
      enabled?: boolean
      /**
       * Determines whether the checkbox for saved cards is visible.
       *
       * @defaultValue `true`
       */
      optInVisible?: boolean
    }
    submitButton?: {
      /**
       * Visibility of the submit button in the form.
       *
       * @defaultValue `true`
       */
      visible?: boolean
      /**
       * Type of the submit button.
       *
       * @defaultValue `"pay"`
       */
      type?:
        | 'book'
        | 'buy'
        | 'checkout'
        | 'donate'
        | 'order'
        | 'pay'
        | 'subscribe'
        | 'topUp'
    }
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
  }
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
     * Locale for the payment form.
     *
     * @defaultValue `"en-US"`
     */
    locale?: 'en-US' | 'el-GR' | 'ro-RO'
  }

  /**
   * Callback executed when the form submission state changes.
   *
   * @param isProcessing - `true` if the form is processing a payment, `false` otherwise.
   */
  onPaymentProcessing?: (isProcessing: boolean) => void
}

/**
 * Represents an instance of the XMoney payment card, providing methods to interact with and manage the form.
 */
export interface XMoneyPaymentCardInstance extends XMoneyBaseInstance {
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
   * Submits the payment.
   */
  submit: () => void

  /**
   * Validates the payment fields and returns the validation result.
   *
   * @returns An object containing the validation status and any errors found.
   */
  validate: () => Promise<{
    isValid: boolean
    errors: Record<string, { message: string; code: string }>
  }>
}
