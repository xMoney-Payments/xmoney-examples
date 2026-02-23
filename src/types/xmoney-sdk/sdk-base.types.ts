import type { TransactionDetails } from '../checkout.types'

export type FormButtonType =
  | 'book'
  | 'buy'
  | 'checkout'
  | 'donate'
  | 'order'
  | 'pay'
  | 'subscribe'
  | 'topUp'
export type ValidationMode = 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched'
export type Theme = 'light' | 'dark' | 'custom'
export type Locale = 'en-US' | 'el-GR' | 'ro-RO'

export type GooglePayButtonType =
  | 'book'
  | 'buy'
  | 'checkout'
  | 'donate'
  | 'order'
  | 'plain'
  | 'pay'
  | 'subscribe'
export type GooglePayButtonColor = 'white' | 'black'
export type GooglePayButtonBorderType = 'default_border' | 'no_border'

export type ApplePayButtonStyle = 'white' | 'black' | 'white-outline'
export type ApplePayButtonType =
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

/**
 * Base configuration options shared by all xMoney SDK methods.
 */
export interface XMoneyBaseConfig {
  /**
   * HTML element selector (CSS string) or a direct HTMLElement reference where the payment form will be rendered.
   *
   * @example "#payment-form-container"
   * @example document.getElementById("payment-form-container")
   *
   * @remarks
   * This field is **required**.
   */
  container: string | HTMLElement

  /**
   * Checksum for the order, used for request integrity validation.
   *
   * @remarks
   * This field is **required**.
   */
  orderChecksum: string

  /**
   * Base64-encoded order payload containing order details.
   *
   * @remarks
   * This field is **required**.
   */
  orderPayload: string

  /**
   * Public API key for the payment form, e.g., `"pk_{env}_{siteId}"`.
   *
   * @remarks
   * This field is **required**.
   */
  publicKey: string

  /**
   * Callback executed when the payment form is fully initialized and ready.
   */
  onReady?: () => void

  /**
   * Callback executed when an error occurs within the payment form.
   *
   * @param err - The error object or message.
   */
  onError?: (err: { code: number; message: string } | string) => void

  /**
   * Callback executed when the payment is completed.
   *
   * @param data - Payment completion response data.
   */
  onPaymentComplete?: (data: TransactionDetails) => void
  /**
   * Callback executed when the form submission state changes.
   *
   * @param isProcessing - `true` if the form is submitting, `false` otherwise.
   */
  onPaymentProcessing?: (isProcessing: boolean) => void
}

export interface XMoneyBaseInstance {
  /**
   * Updates the order details in the payment form.
   *
   * @param orderPayload - Base64-encoded updated order payload.
   * @param orderChecksum - Checksum to validate the updated order.
   */
  updateOrder: ({
    orderPayload,
    orderChecksum,
  }: {
    orderPayload: string
    orderChecksum: string
  }) => void

  /**
   * Cleans up and completely destroys the payment form instance.
   *
   * @remarks
   * After calling this, the instance cannot be reused.
   */
  destroy: () => void
}
