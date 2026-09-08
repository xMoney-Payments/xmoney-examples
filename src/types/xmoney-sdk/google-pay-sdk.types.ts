import type {
  GooglePayAppearance,
  BaseConfig,
  BaseInstance,
  SharedOptions,
} from "./sdk-base.types";

/**
 * Configuration options for initializing and customizing the Google Pay button.
 */
export interface GooglePayConfig extends BaseConfig {
  /**
   * Options for customizing the appearance and behavior of Google Pay.
   */
  options?: SharedOptions & {
    /**
     * Official Google Pay button options only (`color`, `type`, `radius`,
     * `height`, `borderType`). Custom CSS, theme variables, and custom
     * artwork are not allowed by Google’s brand guidelines.
     */
    appearance?: GooglePayAppearance;
  };
}

/**
 * Represents an instance of Google Pay, providing methods to interact with and manage the payment.
 */
export interface GooglePayInstance extends BaseInstance {}
