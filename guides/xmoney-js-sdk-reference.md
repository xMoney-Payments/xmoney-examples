# Embedded Checkout

The **xMoney.js SDK** (`xmoney.js`) powers **Embedded Checkout**, allowing you to securely embed the payment form directly into your website. It handles input validation, secure card data collection, and payment processing without sensitive data ever touching your servers.

**Embedded Checkout** keeps customers on your site throughout the payment process, unlike Hosted Checkout which redirects to xMoney's payment page.

## Installation

Include the script on every page where you want to render the payment form.

```html
<script src="https://secure.xmoney.com/sdk/v1/xmoney.js"></script>
```

## About Embedded Checkout

**Embedded Checkout** is xMoney's solution for accepting payments directly on your website. The payment form is embedded in your page using an iframe, providing a seamless checkout experience without redirecting customers away from your site.

**Key Benefits:**

- Customers stay on your website throughout checkout
- Full control over checkout page design and flow
- PCI DSS compliant - card data never touches your servers
- Supports cards, Google Pay, and Apple Pay

For redirect-based checkout flows, see [Hosted Checkout](../checkout/hosted-checkout.md).

## Initialization

To create an Embedded Checkout payment form, instantiate the `XMoneyPaymentForm` class.

```javascript
const checkout = new window.XMoneyPaymentForm({
  // Required
  container: 'payment-form-widget',
  publicKey: 'pk_test_12345',
  orderPayload: '...', // Received from your server
  orderChecksum: '...', // Received from your server

  // Configuration
  options: {
    locale: 'en-US',
    buttonType: 'pay',
    validationMode: 'onChange',
    displaySubmitButton: true,
    displaySaveCardOption: true,
    enableSavedCards: true,
    // Wallets
    googlePay: { enabled: true },
    applePay: { enabled: true },
    // Styling
    appearance: {
      theme: 'custom',
      variables: {
        colorPrimary: '#6366f1',
      },
    },
  },

  // Lifecycle Callbacks (all optional)
  onReady: () => console.log('Form is ready'),
  onError: (error) => console.error('Form error', error),
  onPaymentComplete: (data) => console.log('Payment completed', data),
  onSubmitPending: (isPending) => console.log('Processing...', isPending),
})
```

## Configuration Properties

| Property            | Type       | Required | Description                                                            |
| :------------------ | :--------- | :------: | :--------------------------------------------------------------------- |
| `container`         | `string`   | **Yes**  | DOM element ID where the form will be rendered.                        |
| `publicKey`         | `string`   | **Yes**  | Your Site ID public key (`pk_test_...` or `pk_live_...`).              |
| `orderPayload`      | `string`   | **Yes**  | Base64-encoded encrypted order data from your backend.                 |
| `orderChecksum`     | `string`   | **Yes**  | HMAC signature of the payload from your backend.                       |
| `options`           | `object`   |    No    | Customization options (see below).                                     |
| `onReady`           | `function` |    No    | Callback fired when form is ready.                                     |
| `onError`           | `function` |    No    | Callback fired on form initialization errors (not transaction errors). |
| `onPaymentComplete` | `function` |    No    | Callback fired when payment is completed (success or failure).         |
| `onSubmitPending`   | `function` |    No    | Callback fired when submission state changes.                          |

## Options

The `options` object controls the behavior and look of the form.

### Functional Options

| Option                    | Type                            | Default      | Description                                                                            |
| :------------------------ | :------------------------------ | :----------- | :------------------------------------------------------------------------------------- |
| `locale`                  | `'en-US' \| 'el-GR' \| 'ro-RO'` | `'en-US'`    | Language for labels and error messages.                                                |
| `displaySubmitButton`     | `boolean`                       | `true`       | If `false`, you must call `checkout.submit()` manually.                                |
| `buttonType`              | `string`                        | `'pay'`      | Text on the submit button (e.g., `'pay'`, `'book'`, `'subscribe'`).                    |
| `validationMode`          | `string`                        | `'onChange'` | When validation triggers: `'onSubmit'`, `'onChange'`, `'onBlur'`, `'onTouched'`.       |
| `displaySaveCardOption`   | `boolean`                       | `false`      | Show checkbox to save card for future use.                                             |
| `enableSavedCards`        | `boolean`                       | `false`      | Display saved cards for returning customers.                                           |
| `enableBackgroundRefresh` | `boolean`                       | `false`      | Enable automatic order status polling. When `true`, `onPaymentComplete` will not fire. |

### Saved Cards (One-Click Payment)

To enable one-click payments for returning customers:

1. Set `options.enableSavedCards: true`.
2. Set `options.displaySaveCardOption: true` (to allow saving new cards).

```javascript
options: {
  enableSavedCards: true,
  displaySaveCardOption: true,
}
```

### Digital Wallets

You can enable Google Pay and Apple Pay directly within the form.

#### Google Pay

```javascript
options: {
  googlePay: {
    enabled: true,
    appearance: {
      color: "black", // "white" | "black"
      type: "pay",    // "buy", "book", "donate", etc.
      radius: 12,     // Corner radius in pixels (default: 12)
      borderType: "no_border" // "default_border" | "no_border" (default: "no_border")
    }
  }
}
```

**Properties**:

- `enabled` (boolean): Enable Google Pay. Default: `false`
- `appearance.color`: Button color. Defaults to `'black'` in light theme, `'white'` in dark theme
- `appearance.type`: Button action type. Default: `'pay'`
- `appearance.radius`: Corner radius in pixels. Default: `12`
- `appearance.borderType`: Border style. Default: `'no_border'`

#### Apple Pay

```javascript
options: {
  applePay: {
    enabled: true,
    appearance: {
      style: "black", // "white" | "black" | "white-outline"
      type: "pay",    // See Apple Pay button types below
      radius: 12      // Corner radius in pixels (default: 12)
    }
  }
}
```

**Properties**:

- `enabled` (boolean): Enable Apple Pay. Default: `false`
- `appearance.style`: Button style. Defaults to `'black'` in light theme, `'white'` in dark theme
- `appearance.type`: Button action type. Default: `'pay'`
- `appearance.radius`: Corner radius in pixels. Default: `12`

**Apple Pay Button Types**: `'add-money'`, `'book'`, `'buy'`, `'checkout'`, `'contribute'`, `'continue'`, `'donate'`, `'order'`, `'plain'`, `'pay'`, `'reload'`, `'rent'`, `'set-up'`, `'subscribe'`, `'support'`, `'tip'`, `'top-up'`

**Note**: Digital wallets only appear if supported by the user's device/browser and if the user has a wallet set up.

### Card Holder Verification

Verify cardholder name against bank records before processing payment:

```javascript
options: {
  cardHolderVerification: {
    name: {
      firstName: "John",
      middleName: "", // Optional
      lastName: "Doe"
    },
    onCardHolderVerification: (result) => {
      // result.status can be:
      // - 'MATCHED': Name matches bank records
      // - 'NOT_MATCHED': Name does not match
      // - 'PARTIAL_MATCH': Partial match (e.g., first name matches, last name doesn't)
      // - 'NOT_CHECKED': Verification was not performed
      
      // Return true to proceed, false to block payment
      return result.status === 'MATCHED'
    }
  }
}
```

**Verification Statuses**:

- `'MATCHED'`: Cardholder name matches bank records
- `'NOT_MATCHED'`: Cardholder name does not match
- `'PARTIAL_MATCH'`: Partial match (e.g., first name matches, last name doesn't)
- `'NOT_CHECKED'`: Verification was not performed

## Customization (Theming)

Use the `appearance` object to match the form to your brand.

```javascript
options: {
  appearance: {
    theme: "custom", // 'light' | 'dark' | 'custom'
    variables: {
      colorPrimary: "#0d9488",        // Brand color (focus, buttons)
      colorDanger: "#ef4444",         // Error text
      colorBackground: "#ffffff",     // Form background
      colorText: "#1f2937",           // Primary text
      colorTextSecondary: "#6b7280",  // Labels/Hints
      colorTextPlaceholder: "#bdbdbd", // Placeholder text
      colorBorder: "#e5e7eb",         // Input borders
      colorBorderFocus: "#0d9488",    // Active input border
      colorBackgroundFocus: "#f0fdfa", // Focused input background
      borderRadius: "8px"
    }
  }
}
```

**Theme Options**:

- `'light'`: Default light theme (no variables needed)
- `'dark'`: Dark theme optimized for dark backgrounds
- `'custom'`: Use your own color variables

**Best Practice**: When using `'custom'` theme, provide all color variables for consistency. The SDK uses sensible defaults for any missing variables.

## Instance Methods

Once initialized, you can control the form instance programmatically.

### `updateOrder(payload: string, checksum: string): void`

Updates the transaction details (e.g., if the user changes the cart total) without reloading the iframe.

```javascript
checkout.updateOrder(newPayload, newChecksum)
```

**Use Cases**:

- Cart updates (add/remove items)
- Applying discount codes
- Changing shipping options
- Dynamic pricing updates

### `updateLocale(locale: 'en-US' | 'el-GR' | 'ro-RO'): void`

Dynamically changes the language.

```javascript
checkout.updateLocale('el-GR') // Switch to Greek
```

**Supported locales**: `'en-US'`, `'el-GR'`, `'ro-RO'`

### `updateAppearance(appearance: AppearanceOptions): void`

Updates the theme at runtime.

```javascript
// Switch to dark theme
checkout.updateAppearance({ theme: 'dark' })

// Update custom colors
checkout.updateAppearance({
  theme: 'custom',
  variables: {
    colorPrimary: '#10b981',
    borderRadius: '12px',
  },
})
```

### `submit(): void`

Triggers the payment submission. Useful if `displaySubmitButton` is `false`.

```javascript
checkout.submit()
```

### `close(): void`

Hides/closes the form UI without destroying the instance. The form can be shown again later.

```javascript
checkout.close()
```

### `destroy(): void`

Removes the iframe and cleans up event listeners. **Always call this when the component unmounts** to prevent memory leaks.

```javascript
// React useEffect cleanup example
useEffect(() => {
  const checkout = new window.XMoneyPaymentForm({ /* ... */ })
  
  return () => {
    checkout.destroy() // Critical: prevents memory leaks
  }
}, [])
```

## Callbacks

All callbacks are optional.

| Callback                     | Type                               | Description                                                                                                                                                                                                                       |
| :--------------------------- | :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onReady()`                  | `() => void`                       | Fired when the iframe has fully loaded and is interactive.                                                                                                                                                                        |
| `onError(err)`               | `(error: string \| Error) => void` | Fired when form initialization fails (e.g., invalid configuration, network errors during initialization). **Note**: This does not fire for transaction errors. Transaction errors are handled via `onPaymentComplete`.            |
| `onPaymentComplete(data)`    | `(data: object) => void`           | Fired when payment is completed, regardless of success or failure. Receives the transaction result (e.g., `{ orderId: "...", status: "...", customerId: 123 }`). Check the `status` field to determine if payment was successful. |
| `onSubmitPending(isPending)` | `(isPending: boolean) => void`     | Fired when the form starts (`true`) or ends (`false`) network activity. Use to show/hide loading spinners.                                                                                                                        |

## Example Usage

The following examples demonstrate how to integrate Embedded Checkout into your application.

### Basic Integration

```javascript
const checkout = new window.XMoneyPaymentForm({
  container: 'payment-form-widget',
  publicKey: 'pk_test_your_key',
  orderPayload: payload, // From your server
  orderChecksum: checksum, // From your server
  onReady: () => {
    console.log('Form is ready')
    document.getElementById('payment-form-widget').style.opacity = '1'
  },
  onError: (error) => {
    console.error('Form initialization error:', error)
    alert('Failed to load payment form. Please refresh the page.')
  },
  onPaymentComplete: (data) => {
    console.log('Payment completed:', data)
    // Check payment status
    if (data.status === 'complete-ok') {
      window.location.href = '/checkout/success'
    } else {
      alert('Payment failed. Please try again.')
    }
  },
})
```

### With Saved Cards

```javascript
const checkout = new window.XMoneyPaymentForm({
  container: 'payment-form-widget',
  publicKey: 'pk_test_your_key',
  orderPayload: payload,
  orderChecksum: checksum,
  options: {
    enableSavedCards: true,
    displaySaveCardOption: true,
  },
  onPaymentComplete: (data) => {
    // Store customerId if returned for future use
    if (data.customerId) {
      localStorage.setItem('xmoney_customer_id', data.customerId)
    }
  },
})
```

### With Custom Theme

```javascript
const checkout = new window.XMoneyPaymentForm({
  container: 'payment-form-widget',
  publicKey: 'pk_test_your_key',
  orderPayload: payload,
  orderChecksum: checksum,
  options: {
    appearance: {
      theme: 'custom',
      variables: {
        colorPrimary: '#10b981',
        colorDanger: '#ef4444',
        borderRadius: '12px',
      },
    },
  },
})
```

## Backend API Integration

To initialize Embedded Checkout, create a payment intent on your server that returns the encrypted `payload` and `checksum`.

### Backend Example

{% code-group %}

```typescript {% title="Node.js" %}
const crypto = require('crypto')

function getBase64JsonRequest(orderData) {
  const jsonText = JSON.stringify(orderData)
  return Buffer.from(jsonText).toString('base64')
}

function getBase64Checksum(orderData, secretKey) {
  const hmacSha512 = crypto.createHmac('sha512', secretKey)
  hmacSha512.update(JSON.stringify(orderData))
  return hmacSha512.digest('base64')
}

// API route handler (Next.js, Express, etc.)
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { amount, currency, description, publicKey } = req.body

  // API key is stored server-side (e.g., environment variable)
  const apiKey = process.env.XMONEY_SECRET_KEY

  if (!publicKey || !apiKey) {
    return res.status(400).json({ error: 'Missing credentials' })
  }

  const orderData = {
    publicKey: publicKey,
    customer: {
      identifier: 'customer-123', // Your internal customer ID
      firstName: 'John',
      lastName: 'Doe',
      country: 'RO', // ISO 3166-1 alpha-2
      city: 'Bucharest',
      email: 'john.doe@example.com',
    },
    order: {
      orderId: `order-${Date.now()}`,
      description: description,
      type: 'purchase',
      amount: amount, // Amount in smallest currency unit (cents)
      currency: currency, // ISO 4217 code (e.g., 'EUR', 'USD')
    },
    cardTransactionMode: 'authAndCapture',
    backUrl: 'https://yoursite.com/checkout/result',
  }

  try {
    const payload = getBase64JsonRequest(orderData)
    const checksum = getBase64Checksum(orderData, apiKey)

    res.json({ payload, checksum })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

```php {% title="PHP" %}
<?php

function getBase64JsonRequest(array $orderData) {
    return base64_encode(json_encode($orderData));
}

function getBase64Checksum(array $orderData, $secretKey) {
    $hmacSha512 = hash_hmac('sha512', json_encode($orderData), $secretKey, true);
    return base64_encode($hmacSha512);
}

// API route handler
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$amount = $input['amount'] ?? 100;
$currency = $input['currency'] ?? 'EUR';
$description = $input['description'] ?? 'Test Order';
$publicKey = $input['publicKey'] ?? null;

// API key is stored server-side (e.g., environment variable)
$apiKey = $_ENV['XMONEY_SECRET_KEY'] ?? getenv('XMONEY_SECRET_KEY');

if (!$publicKey || !$apiKey) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing credentials']);
    exit;
}

$orderData = [
    'publicKey' => $publicKey,
    'customer' => [
        'identifier' => 'customer-123', // Your internal customer ID
        'firstName' => 'John',
        'lastName' => 'Doe',
        'country' => 'RO', // ISO 3166-1 alpha-2
        'city' => 'Bucharest',
        'email' => 'john.doe@example.com',
    ],
    'order' => [
        'orderId' => 'order-' . time(),
        'description' => $description,
        'type' => 'purchase',
        'amount' => $amount, // Amount in smallest currency unit (cents)
        'currency' => $currency, // ISO 4217 code (e.g., 'EUR', 'USD')
    ],
    'cardTransactionMode' => 'authAndCapture',
    'backUrl' => 'https://yoursite.com/checkout/result',
];

try {
    $payload = getBase64JsonRequest($orderData);
    $checksum = getBase64Checksum($orderData, $apiKey);

    header('Content-Type: application/json');
    echo json_encode(['payload' => $payload, 'checksum' => $checksum]);
} catch (Exception $e) {
    error_log('Error creating payment intent: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
```

{% /code-group %}

### Frontend Integration

```javascript
// Fetch payment intent from your backend
async function initializeCheckout() {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 10000, // Amount in cents
      currency: 'EUR',
      description: 'Order #12345',
      publicKey: 'pk_test_your_key', // Public key can be sent from frontend
    }),
  })

  const { payload, checksum } = await response.json()

  // Initialize Embedded Checkout
  const checkout = new window.XMoneyPaymentForm({
    container: 'payment-form-widget',
    publicKey: 'pk_test_your_key',
    orderPayload: payload,
    orderChecksum: checksum,
    onReady: () => console.log('Form ready'),
    onPaymentComplete: (data) => {
      console.log('Payment completed:', data)
    },
  })
}
```

**Important**: The secret key (`sk_...`) should always be stored server-side (e.g., environment variables) and never exposed to the frontend.
