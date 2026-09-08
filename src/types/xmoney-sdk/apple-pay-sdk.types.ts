import type {
  ApplePayAppearance,
  BaseConfig,
  BaseInstance,
  SharedOptions,
} from "./sdk-base.types";

/**
 * Configuration options for initializing and customizing Apple Pay.
 */
export interface ApplePayConfig extends BaseConfig {
  /**
   * Options for customizing the appearance and behavior of Apple Pay.
   */
  options?: SharedOptions & {
    /**
     * Official Apple Pay button options only (`style`, `type`, `radius`,
     * `height`). Custom CSS, theme variables, and custom artwork are not
     * allowed by Apple’s brand guidelines.
     */
    appearance?: ApplePayAppearance;
  };
}

/**
 * Represents an instance of Apple Pay, providing methods to interact with and manage the payment.
 */
export interface ApplePayInstance extends BaseInstance {}
