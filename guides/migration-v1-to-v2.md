# Migration Guide: xMoney SDK v1 → v2

This guide covers all breaking changes, renamed APIs, restructured config options, and new features introduced in v2, based on a type-level diff between versions.

---

## Table of Contents

1. [Global API — Breaking Change](#1-global-api--breaking-change)
2. [Instantiation — Breaking Change](#2-instantiation--breaking-change)
3. [XMoneyBaseConfig changes](#3-xmoneybaseconfig-changes)
4. [XMoneyPaymentFormConfig restructure — Breaking Change](#4-xmoneypaymentformconfig-restructure--breaking-change)
5. [XMoneyPaymentFormInstance — new method](#5-xmoneypaymentforminstance--new-method)
6. [TransactionDetails — Breaking Change](#6-transactiondetails--breaking-change)
7. [TransactionCustomerData — new fields](#7-transactioncustomerdata--new-fields)
8. [Removed types](#8-removed-types)
9. [New standalone SDK components](#9-new-standalone-sdk-components)
10. [New exported primitive types](#10-new-exported-primitive-types)

---

## 1. Global API — Breaking Change

The SDK is no longer exposed as a single class on `window.XMoneyPaymentForm`. It is now a namespace object at `window.XMoney` with factory methods for each payment component.

**v1**

```ts
// window.XMoneyPaymentForm: XMoneyPaymentForm
declare global {
  interface Window {
    XMoneyPaymentForm: XMoneyPaymentForm
  }
}
```

**v2**

```ts
declare global {
  interface Window {
    XMoney: {
      paymentForm: (
        config: XMoneyPaymentFormConfig
      ) => Promise<XMoneyPaymentFormInstance>
      paymentCard: (
        config: XMoneyPaymentCardConfig
      ) => Promise<XMoneyPaymentCardInstance>
      savedCardPayment: (
        config: XMoneySavedCardPaymentConfig
      ) => Promise<XMoneySavedCardPaymentInstance>
      googlePay: (
        config: XMoneyGooglePayConfig
      ) => Promise<XMoneyGooglePayInstance>
      applePay: (
        config: XMoneyApplePayConfig
      ) => Promise<XMoneyApplePayInstance>
      getPaymentMethodCapabilities: () => Promise<PaymentMethodCapabilities>
    }
  }
}
```

---

## 2. Instantiation — Breaking Change

In v1 the form was created via a synchronous `new` constructor. In v2 all factory methods are **async** and return a `Promise`.

**v1**

```ts
const form = new window.XMoneyPaymentForm(config)
```

**v2**

```ts
const form = await window.XMoney.paymentForm(config)
```

The same applies to all other components:

| Component  | v2 factory                              |
| ---------- | --------------------------------------- |
| Card form  | `await XMoney.paymentCard(config)`      |
| Saved card | `await XMoney.savedCardPayment(config)` |
| Google Pay | `await XMoney.googlePay(config)`        |
| Apple Pay  | `await XMoney.applePay(config)`         |

---

## 3. XMoneyBaseConfig changes

### Removed

| Property                          | Notes                         |
| --------------------------------- | ----------------------------- |
| `options.enableBackgroundRefresh` | Removed from the base config. |

### Renamed callbacks

| v1                                                                 | v2                                                                 | Notes                                                                    |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `onSubmitPending(isPending: boolean)` on `XMoneyPaymentFormConfig` | `onPaymentProcessing(isProcessing: boolean)` on `XMoneyBaseConfig` | Promoted to base config and renamed — applies to **all** components now. |

### Behaviour change — `onPaymentComplete`

In v1, `onPaymentComplete` was documented as **not triggering** when `enableBackgroundRefresh` was `false`. In v2, the callback is unconditional (the `enableBackgroundRefresh` option and caveat no longer exist).

---

## 4. XMoneyPaymentFormConfig restructure — Breaking Change

`XMoneyPaymentFormConfig` now extends `XMoneyPaymentCardConfig` (a new intermediate config) instead of `XMoneyBaseConfig` directly. Many flat `options.*` properties have been moved into new nested objects.

### Card-specific options moved to `card.*`

| v1 `options.*`                   | v2 `card.*`                    |
| -------------------------------- | ------------------------------ |
| `options.validationMode`         | `card.validationMode`          |
| `options.enableSavedCards`       | `card.savedCards.enabled`      |
| `options.displaySaveCardOption`  | `card.savedCards.optInVisible` |
| `options.displaySubmitButton`    | `card.submitButton.visible`    |
| `options.buttonType`             | `card.submitButton.type`       |
| `options.cardHolderVerification` | `card.cardHolderVerification`  |

**v1**

```ts
{
  options: {
    buttonType: "pay",
    validationMode: "onChange",
    enableSavedCards: true,
    displaySaveCardOption: true,
    displaySubmitButton: true,
    cardHolderVerification: { ... },
  }
}
```

**v2**

```ts
{
  card: {
    validationMode: "onChange",
    savedCards: { enabled: true, optInVisible: true },
    submitButton: { visible: true, type: "pay" },
    cardHolderVerification: { ... },
  }
}
```

### Wallet options moved to `paymentMethods.*`

The Google Pay and Apple Pay blocks are no longer under `options`:

| v1                  | v2                         |
| ------------------- | -------------------------- |
| `options.googlePay` | `paymentMethods.googlePay` |
| `options.applePay`  | `paymentMethods.applePay`  |

**v1**

```ts
{ options: { googlePay: { enabled: true, appearance: { ... } } } }
```

**v2**

```ts
{ paymentMethods: { googlePay: { enabled: true, appearance: { ... } } } }
```

### Options that remain unchanged

The following properties stay under `options`:

- `options.appearance` (`theme`, `variables`, `rules`)
- `options.locale`

---

## 5. XMoneyPaymentFormInstance — new method

| Method           | Signature                                                    | Notes                                                                |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `validate` (new) | `() => { isValid: boolean; errors: Record<string, string> }` | Triggers field validation and returns the result without submitting. |

> **Note:** On the lower-level `XMoneyPaymentCardInstance`, `validate` returns a `Promise` with richer error objects: `Promise<{ isValid: boolean; errors: Record<string, { message: string; code: string }> }>`.

---

## 6. TransactionDetails — Breaking Change

The shape of the object passed to `onPaymentComplete` has been significantly simplified.

### Removed fields

| Field                   | v1 type                  |
| ----------------------- | ------------------------ |
| `siteId`                | `number`                 |
| `orderId`               | `number`                 |
| `customerId`            | `number`                 |
| `transactionType`       | `TransactionTypeEnum`    |
| `transactionMethod`     | `TransactionMethodEnum`  |
| `ip`                    | `string \| null`         |
| `creationDate`          | `string`                 |
| `cardProviderName`      | `string`                 |
| `cardType`              | `string`                 |
| `cardNumber`            | `string`                 |
| `cardExpiryDate`        | `string`                 |
| `cardHolderName`        | `string \| null`         |
| `card`                  | `TransactionDetailsCard` |
| `reason`                | `string \| null`         |
| `parentTransactionId`   | `number`                 |
| `relatedTransactionIds` | `number[]`               |

### Renamed fields

| v1                    | v2                     |
| --------------------- | ---------------------- |
| `currency: string`    | `currencyKey: string`  |
| `amountInEur: string` | `amountInEuro: number` |

### Type changes

| Field                          | v1 type  | v2 type  |
| ------------------------------ | -------- | -------- |
| `amount`                       | `string` | `number` |
| `amountInEur` / `amountInEuro` | `string` | `number` |

### New fields

| Field             | v2 type  | Notes                          |
| ----------------- | -------- | ------------------------------ |
| `externalOrderId` | `string` | Your system's order reference. |

### Summary

**v1**

```ts
interface TransactionDetails {
  id: number
  siteId: number
  orderId: number
  customerId: number
  customerData: TransactionCustomerData
  transactionType: TransactionTypeEnum
  transactionMethod: TransactionMethodEnum
  transactionStatus: TransactionStatusEnum
  ip: string | null
  amount: string // ← string
  currency: string
  amountInEur: string // ← string, "Eur"
  description: string
  creationDate: string
  cardProviderName: string
  cardType: string
  cardNumber: string
  cardExpiryDate: string
  cardHolderName: string | null
  card: TransactionDetailsCard
  reason?: string | null
  parentTransactionId?: number
  relatedTransactionIds?: number[]
}
```

**v2**

```ts
interface TransactionDetails {
  id: number
  transactionStatus: TransactionStatusEnum
  amount: number // ← number
  currencyKey: string // ← renamed
  amountInEuro: number // ← number, "Euro"
  customerData: TransactionCustomerData
  externalOrderId: string // ← new
  description: string
}
```

---

## 7. TransactionCustomerData — new fields

Two fields have been added. No existing fields were removed.

| New field            | Type             |
| -------------------- | ---------------- |
| `isWhitelisted`      | `boolean`        |
| `isWhitelistedUntil` | `string \| null` |

---

## 8. Removed types

The following types existed in v1 and have been removed in v2:

| Type                          | Notes                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `InitializeCheckoutModel`     | Server-side checkout initialisation model — no longer part of the SDK surface. |
| `InitializeCheckoutResponse`  | Counterpart response — removed alongside the above.                            |
| `TransactionTypeEnum`         | No longer present on `TransactionDetails`.                                     |
| `TransactionMethodEnum`       | No longer present on `TransactionDetails`.                                     |
| `CardStatusEnum`              | Removed.                                                                       |
| `xMoneyOrderStatusEnum`       | Removed.                                                                       |
| `xMoneyTransactionMethodEnum` | Removed.                                                                       |
| `xMoneyOrderTypeEnum`         | Removed.                                                                       |
| `TransactionDetailsCard`      | The `card` object has been removed from `TransactionDetails`.                  |

---

## 9. New standalone SDK components

v2 introduces four new independent components, each following the same `XMoneyBaseConfig` contract.

### `XMoney.paymentCard`

A standalone card-only payment element.

```ts
const card = await XMoney.paymentCard(config: XMoneyPaymentCardConfig);
// XMoneyPaymentCardInstance: updateLocale | updateAppearance | submit | validate | updateOrder | close | destroy
```

### `XMoney.googlePay`

A standalone Google Pay button.

```ts
const gPay = await XMoney.googlePay(config: XMoneyGooglePayConfig);
// XMoneyGooglePayInstance: updateOrder | close | destroy
```

### `XMoney.applePay`

A standalone Apple Pay button.

```ts
const aPay = await XMoney.applePay(config: XMoneyApplePayConfig);
// XMoneyApplePayInstance: updateOrder | close | destroy
```

### `XMoney.savedCardPayment`

Triggers a payment using a previously saved card. Does **not** require a `container` (it omits that field from `XMoneyBaseConfig`).

```ts
const saved = await XMoney.savedCardPayment(config: XMoneySavedCardPaymentConfig);
saved.pay({ cardId: 123 });
```

### `XMoney.getPaymentMethodCapabilities`

Detects which wallet methods are available in the current browser/device context.

```ts
const caps = await XMoney.getPaymentMethodCapabilities()
// { googlePay: { supported: boolean, reason?: string }, applePay: { supported: boolean, reason?: string } }
```

---

## 10. New exported primitive types

v2 extracts many previously inline union types into named exports from `sdk-base.types.ts`, making them reusable across all components.

| Type name                   | Values                                                                                                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FormButtonType`            | `"book" \| "buy" \| "checkout" \| "donate" \| "order" \| "pay" \| "subscribe" \| "topUp"`                                                                                                                  |
| `ValidationMode`            | `"onSubmit" \| "onChange" \| "onBlur" \| "onTouched"`                                                                                                                                                      |
| `Theme`                     | `"light" \| "dark" \| "custom"`                                                                                                                                                                            |
| `Locale`                    | `"en-US" \| "el-GR" \| "ro-RO"`                                                                                                                                                                            |
| `GooglePayButtonType`       | `"book" \| "buy" \| "checkout" \| "donate" \| "order" \| "plain" \| "pay" \| "subscribe"`                                                                                                                  |
| `GooglePayButtonColor`      | `"white" \| "black"`                                                                                                                                                                                       |
| `GooglePayButtonBorderType` | `"default_border" \| "no_border"`                                                                                                                                                                          |
| `ApplePayButtonStyle`       | `"white" \| "black" \| "white-outline"`                                                                                                                                                                    |
| `ApplePayButtonType`        | `"add-money" \| "book" \| "buy" \| "checkout" \| "contribute" \| "continue" \| "donate" \| "order" \| "plain" \| "pay" \| "reload" \| "rent" \| "set-up" \| "subscribe" \| "support" \| "tip" \| "top-up"` |
