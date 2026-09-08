import type {
  BaseConfig,
  BaseInstance,
  SharedOptions,
} from "./sdk-base.types";

/**
 * Configuration options for initializing and customizing Saved Card Payment.
 */
export interface SavedCardPaymentConfig extends Omit<BaseConfig, "container"> {
  options?: SharedOptions;
}

/**
 * Represents an instance of Saved Card Payment, providing methods to interact with and manage the payment.
 */
export interface SavedCardPaymentInstance extends BaseInstance {
  pay: ({ cardId }: { cardId: number }) => void;
}
