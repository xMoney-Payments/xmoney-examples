import type { TransactionDetails } from "../checkout.types";

export type FormButtonType =
  | "book"
  | "buy"
  | "checkout"
  | "donate"
  | "deposit"
  | "order"
  | "pay"
  | "subscribe"
  | "topUp";
export type ValidationMode = "onSubmit" | "onChange" | "onBlur" | "onTouched";
export type CardInputGrouping = "spaced" | "condensed";
export type Theme = "light" | "dark" | "custom";
export type Locale = "en-US" | "el-GR" | "ro-RO" | "bg-BG" | "hu-HU" | "pl-PL";

export type GooglePayButtonType =
  | "book"
  | "buy"
  | "checkout"
  | "donate"
  | "order"
  | "plain"
  | "pay"
  | "subscribe";
export type GooglePayButtonColor = "white" | "black";
export type GooglePayButtonBorderType = "default_border" | "no_border";

export type ApplePayButtonStyle = "white" | "black" | "white-outline";
export type ApplePayButtonType =
  | "add-money"
  | "book"
  | "buy"
  | "checkout"
  | "contribute"
  | "continue"
  | "donate"
  | "order"
  | "plain"
  | "pay"
  | "reload"
  | "rent"
  | "set-up"
  | "subscribe"
  | "support"
  | "tip"
  | "top-up";

export type CardFieldName = "cardHolderName" | "cardNumber" | "expDate" | "cvv";

export type ValidationTrigger = "input" | "blur" | "submit";

type AppearanceRulePart<Base extends string, Part extends string> = [
  Part,
] extends [never]
  ? never
  : `${Base}${Part}`;

/**
 * Allowed `appearance.rules` selector combinations: a base class plus at most
 * one modifier, one pseudo-class, and one pseudo-element from the SDK allowlist.
 */
type AppearanceRuleParts<
  Base extends string,
  Modifier extends string = never,
  PseudoClass extends string = never,
  PseudoElement extends string = never,
> =
  | Base
  | AppearanceRulePart<Base, Modifier>
  | AppearanceRulePart<Base, PseudoClass>
  | AppearanceRulePart<Base, PseudoElement>
  | AppearanceRulePart<Base, `${Modifier}${PseudoClass}`>
  | AppearanceRulePart<Base, `${Modifier}${PseudoElement}`>
  | AppearanceRulePart<Base, `${PseudoClass}${PseudoElement}`>
  | AppearanceRulePart<Base, `${Modifier}${PseudoClass}${PseudoElement}`>;

export type AppearanceRuleSelector =
  | AppearanceRuleParts<
      ".xmoney-label",
      "--empty" | "--invalid" | "--focused"
    >
  | AppearanceRuleParts<
      ".xmoney-input",
      "--empty" | "--invalid",
      ":hover" | ":focus" | ":disabled" | ":autofill",
      "::placeholder" | "::selection"
    >
  | AppearanceRuleParts<".xmoney-error">
  | AppearanceRuleParts<".xmoney-card-group", "--invalid", ":hover">
  | AppearanceRuleParts<".save-card-container">
  | AppearanceRuleParts<
      ".save-card",
      never,
      ":hover" | ":focus-visible" | ":checked",
      "::before"
    >
  | AppearanceRuleParts<".save-card-label">;

/**
 * CSS properties accepted by `options.appearance.rules` (camelCase, matching
 * the SDK allowlist).
 */
export type AppearanceCssProperty =
  | "-moz-osx-font-smoothing"
  | "-webkit-font-smoothing"
  | "-webkit-text-fill-color"
  | "accentColor"
  | "backgroundColor"
  | "borderRadius"
  | "borderBottom"
  | "borderBottomColor"
  | "borderBottomLeftRadius"
  | "borderBottomRightRadius"
  | "borderBottomStyle"
  | "borderBottomWidth"
  | "borderColor"
  | "borderLeft"
  | "borderLeftColor"
  | "borderLeftStyle"
  | "borderLeftWidth"
  | "borderRight"
  | "borderRightColor"
  | "borderRightStyle"
  | "borderRightWidth"
  | "borderStyle"
  | "borderTop"
  | "borderTopColor"
  | "borderTopLeftRadius"
  | "borderTopRightRadius"
  | "borderTopStyle"
  | "borderTopWidth"
  | "borderWidth"
  | "border"
  | "boxShadow"
  | "boxSizing"
  | "clipPath"
  | "color"
  | "fill"
  | "fillOpacity"
  | "fontFamily"
  | "fontSize"
  | "fontStyle"
  | "fontVariant"
  | "fontWeight"
  | "letterSpacing"
  | "lineHeight"
  | "margin"
  | "marginBottom"
  | "marginLeft"
  | "marginRight"
  | "marginTop"
  | "opacity"
  | "outline"
  | "outlineOffset"
  | "padding"
  | "paddingBottom"
  | "paddingLeft"
  | "paddingRight"
  | "paddingTop"
  | "r"
  | "stroke"
  | "strokeOpacity"
  | "strokeWidth"
  | "textAlign"
  | "textDecoration"
  | "textShadow"
  | "textTransform"
  | "transform"
  | "transition"
  | "cursor"
  | "width";

export type AppearanceRuleStyles = Partial<
  Record<AppearanceCssProperty, string>
>;

export type AppearanceRules = {
  [Selector in AppearanceRuleSelector]?: AppearanceRuleStyles;
};

/**
 * CSS variables accepted by `options.appearance.variables`.
 *
 * Known keys map to SDK theme tokens. Extra camelCase keys are also allowed
 * and applied as `--kebab-case` custom properties, so they can be referenced
 * from `rules` (e.g. `color: "var(--brand-accent)"`).
 */
export interface AppearanceVariables {
  colorPrimary?: string;
  colorDanger?: string;
  colorText?: string;
  colorTextSecondary?: string;
  colorTextPlaceholder?: string;
  colorTextDisabled?: string;
  colorBorder?: string;
  colorBorderHover?: string;
  colorBorderFocus?: string;
  colorBackground?: string;
  colorBackgroundInput?: string;
  colorBackgroundHover?: string;
  colorBackgroundFocus?: string;
  colorBackgroundDisabled?: string;
  saveCardSize?: string;
  saveCardCheckSize?: string;
  saveCardCheckColor?: string;
  saveCardBorderWidth?: string;
  saveCardBorderColor?: string;
  saveCardBorderRadius?: string;
  saveCardCheckedBackground?: string;
  saveCardGap?: string;
  borderRadius?: string;
  buttonBorderRadius?: string;
  fontFamily?: string;
  [customVariable: string]: string | undefined;
}

export interface Appearance {
  /**
   * Theme for the payment form.
   *
   * @defaultValue `"light"`
   */
  theme?: Theme;
  /**
   * CSS variables for custom themes. Known tokens plus any extra camelCase
   * keys, which become `--kebab-case` properties usable in `rules`.
   */
  variables?: AppearanceVariables;
  /**
   * CSS rules keyed by allowed selectors (`.xmoney-label`, `.xmoney-input`,
   * `.xmoney-error`, `.xmoney-card-group`, `.save-card`, etc.) with allowed
   * camelCase CSS properties.
   */
  rules?: AppearanceRules;
}

/**
 * Official Google Pay button options. Google does not allow custom button
 * artwork, CSS rules, or theme variables on the mark.
 */
export interface GooglePayAppearance {
  /**
   * Color of the Google Pay button. Use `"black"` on light surfaces and
   * `"white"` on dark surfaces.
   *
   * @defaultValue `"black"`
   */
  color?: GooglePayButtonColor;
  /**
   * Corner radius of the Google Pay button.
   * @defaultValue `12`
   */
  radius?: number;
  /**
   * Type of the Google Pay button.
   * @defaultValue `"plain"`
   */
  type?: GooglePayButtonType;
  /**
   * Border type of the Google Pay button.
   * @defaultValue `"no_border"`
   */
  borderType?: GooglePayButtonBorderType;
  /**
   * Height of the Google Pay button, in pixels. Google’s minimum is 40.
   * @defaultValue `48`
   */
  height?: number;
}

/**
 * Official Apple Pay button options. Apple does not allow custom button
 * artwork, CSS rules, or theme variables on the mark.
 */
export interface ApplePayAppearance {
  /**
   * Style of the Apple Pay button. Use `"black"` or `"white-outline"` on
   * light surfaces and `"white"` on dark surfaces.
   * @defaultValue `"black"`
   */
  style?: ApplePayButtonStyle;
  /**
   * Corner radius of the Apple Pay button.
   * @defaultValue `12`
   */
  radius?: number;
  /**
   * Type of the Apple Pay button.
   * @defaultValue `"plain"`
   */
  type?: ApplePayButtonType;
  /**
   * Height of the Apple Pay button, in pixels. Apple’s minimum is 30.
   * @defaultValue `48`
   */
  height?: number;
}

export interface FieldValidationError {
  message: string;
  code: string;
}

export interface FieldValidationState {
  isValid: boolean;
  isEmpty: boolean;
  error: FieldValidationError | null;
}

export interface ValidationEvent {
  isValid: boolean;
  empty: boolean;
  fields: Record<CardFieldName, FieldValidationState>;
  field?: CardFieldName;
  trigger: ValidationTrigger;
}

export interface PaymentChangeEvent {
  installments: {
    available: boolean;
    count: number;
    amount: number;
    formattedAmount: string;
  };
  button: {
    label: string;
  };
}

export interface SharedOptions {
  /**
   * Locale for the payment UI.
   *
   * @defaultValue `"en-US"`
   */
  locale?: Locale;
}

/**
 * Base configuration options shared by all xMoney SDK methods.
 */
export interface BaseConfig {
  /**
   * Element id (passed to `document.getElementById`) or a direct HTMLElement
   * reference where the payment form will be rendered.
   *
   * @example "payment-form-container"
   * @example document.getElementById("payment-form-container")
   *
   * @remarks
   * This field is **required**.
   */
  container: string | HTMLElement;

  /**
   * Checksum for the order, used for request integrity validation.
   *
   * @remarks
   * This field is **required**.
   */
  orderChecksum: string;

  /**
   * Base64-encoded order payload containing order details.
   *
   * @remarks
   * This field is **required**.
   */
  orderPayload: string;

  /**
   * Public API key for the payment form, e.g., `"pk_{env}_{siteId}"`.
   *
   * @remarks
   * This field is **required**.
   */
  publicKey: string;

  /**
   * Callback executed when the payment form is fully initialized and ready.
   */
  onReady?: () => void;

  /**
   * Callback executed when an error occurs within the payment form.
   *
   * @param err - The error object or message.
   */
  onError?: (err: { code: number | string; message: string } | string) => void;

  /**
   * Callback executed when the payment is completed.
   *
   * @param data - Payment completion response data.
   */
  onPaymentComplete?: (data: TransactionDetails) => void;
  /**
   * Callback executed when the form submission state changes.
   *
   * @param isProcessing - `true` if the form is submitting, `false` otherwise.
   */
  onPaymentProcessing?: (isProcessing: boolean) => void;

  /**
   * Callback executed when card field validation state changes.
   */
  onValidation?: (event: ValidationEvent) => void;

  /**
   * Shared runtime options.
   */
  options?: SharedOptions;
}

export interface BaseInstance {
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
    orderPayload: string;
    orderChecksum: string;
  }) => Promise<{ success: boolean; error?: string }>;

  /**
   * Updates the locale of the payment UI.
   *
   * @param locale - Locale to set.
   */
  updateLocale: (locale: Locale) => void;

  /**
   * Cleans up and completely destroys the payment form instance.
   *
   * @remarks
   * After calling this, the instance cannot be reused.
   */
  destroy: () => void;
}
