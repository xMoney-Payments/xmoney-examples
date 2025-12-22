# xMoney Examples

A collection of interactive examples demonstrating how to integrate xMoney payment forms into your web applications.

## Overview

This repository contains examples showcasing various integration patterns and use cases for the xMoney payment SDK. Each example includes live demos, source code, and detailed documentation.

## Features

- 🎨 **Interactive Examples** - Live, working examples you can test with real payment flows
- 💻 **Source Code** - Complete code for each example
- 📚 **Documentation** - Step-by-step guides and API references
- 🎯 **Best Practices** - Learn the recommended patterns for integrating xMoney
- 🔧 **Customizable** - Easy to modify and adapt to your needs

## Getting Started

### Prerequisites

- Node.js 16+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/xmoney-payments/xmoney-examples.git
cd xmoney-examples
```

1. Install dependencies:

```bash
pnpm install
```

1. (Optional) Configure ports by creating a `.env` file in the root directory:

```bash
VITE_PORT=5173
SERVER_PORT=3001
```

1. Set up your API credentials:
   - Open the application in your browser
   - Click on the API Settings icon in the header
   - Enter your xMoney API credentials:
     - Site ID
     - Public Key
     - Secret Key

### Running the Application

Start the development server:

```bash
pnpm dev
```

This will start both the frontend (Vite) and backend (Express) servers concurrently.

**Default Ports:**

- Frontend (Vite): <http://localhost:5173> (configurable via `VITE_PORT`)
- Backend API: <http://localhost:3001> (configurable via `SERVER_PORT`)

**Customizing Ports:**

You can customize the ports by creating a `.env` file in the root directory:

```bash
VITE_PORT=5173
SERVER_PORT=3001
```

## Technology Stack

- **Frontend:**
  - React 19
  - TanStack Router (file-based routing)
  - Tailwind CSS 4
  - Shadcn UI components
  - xMoney JavaScript SDK

- **Backend:**
  - Express.js
  - TypeScript
  - xMoney Node.js SDK

- **Development:**
  - Vite
  - TypeScript
  - Vitest (testing)

## API Credentials

To use the examples, you'll need xMoney API credentials:

1. **Site ID** - Your site identifier
2. **Public Key** - Starts with `pk_test_` or `pk_live_`
3. **Secret Key** - Starts with `sk_test_` or `sk_live_`

You can get these from your [xMoney Dashboard](https://dashboard.xmoney.com).

> **Note:** Use test credentials (`pk_test_` and `sk_test_`) for development. Never commit live credentials to version control.

## Test Cards

The application includes a test cards reference sheet. Click the credit card icon in the toolbar to view available test cards for different scenarios:

- Success flows (3DS2)
- Frictionless authentication
- Failed transactions
- Various card brands (Visa, Mastercard)

## Documentation

- [xMoney JavaScript SDK Reference](./guides/xmoney-js-sdk-reference.md)
- [xMoney Node.js SDK](https://github.com/xmoney-payments/xmoney-node)
- [xMoney API Documentation](https://docs.xmoney.com)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

- **Documentation:** <https://docs.xmoney.com>
- **Issues:** <https://github.com/xmoney-payments/xmoney-examples/issues>
- **Email:** <support@xmoney.com>

## Related Projects

- [xMoney Node.js SDK](https://github.com/xmoney-payments/xmoney-node) - Official Node.js SDK
- [xMoney Dashboard](https://dashboard.xmoney.com) - Manage your account

---

Made with ❤️ by the xMoney team
