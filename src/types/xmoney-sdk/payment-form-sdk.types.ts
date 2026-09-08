import type {
  PaymentCardConfig,
  PaymentCardInstance,
} from "./payment-card-sdk.types";
import type {
  ApplePayAppearance,
  GooglePayAppearance,
} from "./sdk-base.types";

/**
 * Configuration options for initializing and customizing the payment form.
 */
export interface PaymentFormConfig extends PaymentCardConfig {
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
      enabled?: boolean;
      /**
       * Official Google Pay button options. Custom artwork is not allowed.
       */
      appearance?: GooglePayAppearance;
    };
    /**
     * Configuration for apple payment methods.
     */
    applePay?: {
      /**
       * Enables Apple Pay as a payment option.
       *
       * @defaultValue `false`
       */
      enabled?: boolean;
      /**
       * Official Apple Pay button options. Custom artwork is not allowed.
       */
      appearance?: ApplePayAppearance;
    };
  };
}

/**
 * Represents an instance of the payment form, providing methods to interact with and manage the form.
 */
export interface PaymentFormInstance extends PaymentCardInstance {}
