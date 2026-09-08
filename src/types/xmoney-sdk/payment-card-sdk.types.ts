import type { CardHolderVerificationResult } from "../checkout.types";
import type {
  Appearance,
  CardInputGrouping,
  FieldValidationError,
  FormButtonType,
  PaymentChangeEvent,
  ValidationEvent,
  ValidationMode,
  BaseConfig,
  BaseInstance,
  SharedOptions,
} from "./sdk-base.types";

/**
 * Configuration options for initializing and customizing the xMoney Payment Card element.
 */
export interface PaymentCardConfig extends BaseConfig {
  card?: {
    /**
     * Validation mode for the form.
     *
     * @defaultValue `"onChange"`
     */
    validationMode?: ValidationMode;
    /**
     * Options for displaying saved cards for returning users.
     */
    savedCards?: {
      /**
       * Enables the display of saved cards for returning users.
       *
       * @defaultValue `true`
       */
      enabled?: boolean;
      /**
       * Determines whether the checkbox for saved cards is visible.
       *
       * @defaultValue `true`
       */
      optInVisible?: boolean;
    };
    submitButton?: {
      /**
       * Visibility of the submit button in the form.
       *
       * @defaultValue `true`
       */
      visible?: boolean;
      /**
       * Type of the submit button.
       *
       * @defaultValue `"pay"`
       */
      type?: FormButtonType;
    };
    /**
     * Options for card input layout.
     */
    inputs?: {
      /**
       * Layout of the card number, expiry, and CVV fields.
       *
       * `"spaced"` renders each field separately with labels.
       * `"condensed"` groups them into a single card-style block.
       *
       * @defaultValue `"spaced"`
       */
      grouping?: CardInputGrouping;
    };
    /**
     * Card holder verification options.
     */
    cardHolderVerification?: {
      /**
       * Name information for card holder verification.
       */
      name: {
        firstName: string;
        middleName: string;
        lastName: string;
      };
      /**
       * Callback function for cardholder verification.
       */
      onCardHolderVerification: (
        verificationResult: CardHolderVerificationResult,
      ) => boolean;
    };
  };
  /**
   * Options for customizing the appearance and behavior of form elements.
   */
  options?: SharedOptions & {
    /**
     * Appearance customization options.
     */
    appearance?: Appearance;
  };

  /**
   * Callback executed when the form submission state changes.
   *
   * @param isProcessing - `true` if the form is processing a payment, `false` otherwise.
   */
  onPaymentProcessing?: (isProcessing: boolean) => void;

  /**
   * Callback executed when payment details that affect the CTA change,
   * such as installment availability or the submit button label.
   */
  onPaymentChange?: (event: PaymentChangeEvent) => void;
}

/**
 * Represents an instance of the payment card, providing methods to interact with and manage the form.
 */
export interface PaymentCardInstance extends BaseInstance {
  /**
   * Updates the appearance of the payment form.
   *
   * @param appearance - Theme, CSS variables, and/or CSS rules to apply.
   */
  updateAppearance: (appearance: Appearance) => void;

  /**
   * Submits the payment.
   */
  submit: () => void;

  /**
   * Validates the payment fields and returns the validation result.
   *
   * @returns An object containing the validation status and any errors found.
   */
  validate: () => Promise<
    ValidationEvent & {
      /** @deprecated Use `fields` instead. */
      errors: Record<string, FieldValidationError>;
    }
  >;
}
