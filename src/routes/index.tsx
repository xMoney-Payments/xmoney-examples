import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  CreditCard,
  Settings,
  PlayCircle,
  Key,
  CheckCircle2,
  ArrowRight,
  Code,
  Shield,
  RefreshCw,
  ShoppingCart,
  Layers,
  ShieldCheck,
  LayoutTemplate,
  ArrowUpCircle,
  AlertCircle,
  Gem,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className='min-h-full bg-white'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        {/* Hero Section */}
        <div className='text-center mb-8 sm:mb-12'>
          <div className='inline-flex items-center justify-center mb-6'>
            <img
              src='/xMoney_Logo.svg'
              alt='xMoney Logo'
              className='h-16 w-auto'
            />
          </div>
          <p className='text-lg text-slate-600 max-w-2xl mx-auto mb-8'>
            Interactive examples and code snippets demonstrating how to
            integrate xMoney solutions into your web applications. Explore
            different payment flows, configurations, and features.
          </p>
        </div>

        {/* Getting Started Section */}
        <div className='mb-8 sm:mb-12'>
          <h2 className='text-2xl font-semibold text-slate-900 mb-6'>
            Getting Started
          </h2>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card className='border-2 border-slate-200'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center'>
                    <Key className='w-5 h-5 text-blue-600' />
                  </div>
                  <CardTitle className='text-lg'>
                    1. Configure API Credentials
                  </CardTitle>
                </div>
                <CardDescription>
                  Set up your xMoney API credentials to start testing payment
                  flows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-slate-600 mb-4'>
                  Click on the Setup API button in the header to enter your
                  Site ID, Public Key, and Secret Key. These credentials are
                  stored locally in your browser.
                </p>
                <div className='flex items-center gap-2 text-sm text-slate-500'>
                  <CheckCircle2 className='w-4 h-4 text-green-600' />
                  <span>Credentials stored persistently in localStorage</span>
                </div>
              </CardContent>
            </Card>

            <Card className='border-2 border-slate-200'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center'>
                    <PlayCircle className='w-5 h-5 text-green-600' />
                  </div>
                  <CardTitle className='text-lg'>2. Explore Examples</CardTitle>
                </div>
                <CardDescription>
                  Browse interactive examples from the header and see live
                  implementations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-slate-600 mb-4'>
                  Each example includes a live demo, source code, and
                  documentation. Use the header navigation to explore different
                  payment scenarios.
                </p>
                <div className='flex items-center gap-2 text-sm text-slate-500'>
                  <Code className='w-4 h-4 text-blue-600' />
                  <span>View code examples for each implementation</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommended path */}
        <div className='mb-8 sm:mb-12'>
          <h2 className='text-2xl font-semibold text-slate-900 mb-2'>
            Recommended path
          </h2>
          <p className='text-slate-600 mb-6'>
            Follow this sequence if you are new to the xMoney JS SDK.
          </p>
          <div className='grid gap-3'>
            {[
              {
                step: '1',
                title: 'Configure credentials',
                description:
                  'Use Setup API in the header. Invalid checksums usually mean a missing or mismatched secret key.',
                icon: Key,
              },
              {
                step: '2',
                title: 'Payment Form Configuration',
                to: '/payment-form/configuration',
                description:
                  'Learn init options, theming, wallets, and programmatic submit/validate.',
                icon: Settings,
              },
              {
                step: '3',
                title: 'Checkout',
                to: '/examples/checkout',
                description:
                  'See the payment form inside a real cart and order summary.',
                icon: ShoppingCart,
              },
              {
                step: '4',
                title: 'Embedded Checkout',
                to: '/examples/embedded-checkout',
                description:
                  'Compose paymentCard, saved cards, Google Pay, and Apple Pay yourself.',
                icon: LayoutTemplate,
              },
              {
                step: '5',
                title: 'Migration v1 → v2',
                to: '/migration',
                description:
                  'Upgrade existing integrators: namespace, async factories, and renamed callbacks.',
                icon: ArrowUpCircle,
              },
            ].map((item) => {
              const Icon = item.icon
              const inner = (
                <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors'>
                  <CardContent className='pt-6 flex items-start gap-4'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-semibold'>
                      {item.step}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <Icon className='w-4 h-4 text-blue-600' />
                        <CardTitle className='text-base'>{item.title}</CardTitle>
                      </div>
                      <p className='text-sm text-slate-600'>{item.description}</p>
                    </div>
                    {item.to && (
                      <ArrowRight className='w-4 h-4 mt-1 text-slate-400 shrink-0' />
                    )}
                  </CardContent>
                </Card>
              )
              return item.to ? (
                <Link key={item.step} to={item.to} className='block'>
                  {inner}
                </Link>
              ) : (
                <div key={item.step}>{inner}</div>
              )
            })}
          </div>
        </div>

        {/* Payment Form vs Embeddable */}
        <div className='mb-8 sm:mb-12'>
          <h2 className='text-2xl font-semibold text-slate-900 mb-2'>
            Payment Form vs Embeddable Components
          </h2>
          <p className='text-slate-600 mb-6'>
            Use the full payment form when you want a complete checkout widget.
            Use embeddable components when you need to place card fields, wallets,
            or saved-card charges into your own layout.
          </p>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card className='border-2 border-slate-200'>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <CreditCard className='w-5 h-5 text-indigo-600' />
                  Payment Form
                </CardTitle>
                <CardDescription>
                  <code className='text-xs'>window.XMoney.paymentForm()</code>
                </CardDescription>
              </CardHeader>
              <CardContent className='text-sm text-slate-600 space-y-2'>
                <p>
                  Bundles card input, optional saved cards, Google Pay, and Apple
                  Pay with a submit button and theming.
                </p>
                <p>
                  Best for a drop-in checkout. Start with Configuration, then
                  Checkout or the VELVET multi-step embeddable checkout.
                </p>
              </CardContent>
            </Card>
            <Card className='border-2 border-slate-200'>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Layers className='w-5 h-5 text-purple-600' />
                  Embeddable Components
                </CardTitle>
                <CardDescription>
                  <code className='text-xs'>
                    paymentCard / googlePay / applePay / savedCardPayment
                  </code>
                </CardDescription>
              </CardHeader>
              <CardContent className='text-sm text-slate-600 space-y-2'>
                <p>
                  Mount only the pieces you need. You own the CTA, tabs, and
                  surrounding UI.
                </p>
                <p>
                  Best for branded checkouts. Start with Component Configuration,
                  then Custom CTA or Embedded Checkout.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className='mb-8 border-2 border-amber-200 bg-amber-50/60 sm:mb-12'>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <AlertCircle className='w-5 h-5 text-amber-600' />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-slate-600 space-y-2'>
            <p>
              <span className='font-medium text-slate-900'>Missing credentials.</span>{' '}
              Open Setup API in the header. Site ID, public key, and secret key
              must belong to the same environment (test or live).
            </p>
            <p>
              <span className='font-medium text-slate-900'>Invalid checksum.</span>{' '}
              Usually the secret key in session storage does not match the public
              key used to initialize the SDK.
            </p>
            <p>
              <span className='font-medium text-slate-900'>SDK not loaded.</span>{' '}
              Confirm secure.xmoney.com is reachable and the SDK script loads
              in the page.
            </p>
            <p>
              <span className='font-medium text-slate-900'>Wallets unavailable.</span>{' '}
              Google Pay and Apple Pay depend on browser, device, and domain.
              Demos surface capability checks where wallets are enabled.
            </p>
          </CardContent>
        </Card>

        {/* Payment Form Features Section */}
        <div className='mb-8 sm:mb-12'>
          <div className='mb-6'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-2'>
              Payment Form Features
            </h2>
            <p className='text-slate-600'>
              Explore the payment form's built-in features and configuration
              options to customize its behavior and appearance.
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <Settings className='w-5 h-5 text-blue-600' />
                  <CardTitle className='text-base'>
                    Payment Form Configuration
                  </CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  Customize payment form options and settings
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Explore all available payment form configuration options
                  including locale settings, button types, validation modes, and
                  display preferences. See how different configurations affect
                  the form appearance and behavior in real-time.
                </p>
                <Link to='/payment-form/configuration' className='mt-auto'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <Shield className='w-5 h-5 text-blue-600' />
                  <CardTitle className='text-base'>
                    Card Holder Verification
                  </CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  Verify cardholder name against bank records
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Enhance security by verifying the cardholder's name against
                  bank records before processing payment. This example shows how
                  to implement cardholder verification, handle different match
                  statuses (matched, not matched, partial match), and make
                  decisions based on verification results.
                </p>
                <Link
                  to='/payment-form/card-holder-verification'
                  className='mt-auto'
                >
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <RefreshCw className='w-5 h-5 text-blue-600' />
                  <CardTitle className='text-base'>Runtime Updates</CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  Update payment form options dynamically
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Dynamically update payment form settings without reloading the
                  page. Learn how to change order details, locale, currency, and
                  other form options at runtime. Perfect for multi-step checkout
                  flows or dynamic pricing scenarios.
                </p>
                <Link to='/payment-form/runtime-updates' className='mt-auto'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Embeddable Components Section */}
        <div className='mb-8 sm:mb-12'>
          <div className='mb-6'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-2'>
              Embeddable Components
            </h2>
            <p className='text-slate-600'>
              Standalone embeddable components that can be dropped into any page
              to provide payment functionality without a full payment form.
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <Layers className='w-5 h-5 text-blue-600' />
                  <CardTitle className='text-base'>
                    Component Configuration
                  </CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  Customize embeddable component options and settings
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Explore all available configuration options for embeddable
                  components including locale settings, button types, validation
                  modes, and display preferences. See how different
                  configurations affect the component appearance and behavior in
                  real-time.
                </p>
                <Link
                  to='/embeddable-components/configuration'
                  className='mt-auto'
                >
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <ShieldCheck className='w-5 h-5 text-blue-600' />
                  <CardTitle className='text-base'>
                    Card Holder Verification
                  </CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  Verify cardholder name against bank records
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Enhance security by verifying the cardholder's name against
                  bank records using an embeddable component. This example shows
                  how to implement cardholder verification, handle different
                  match statuses, and make decisions based on verification
                  results.
                </p>
                <Link
                  to='/embeddable-components/card-holder-verification'
                  className='mt-auto'
                >
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <RefreshCw className='w-5 h-5 text-blue-600' />
                  <CardTitle className='text-base'>Runtime Updates</CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  Update embeddable component options dynamically
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Dynamically update embeddable component settings without
                  reloading the page. Learn how to change order details, locale,
                  currency, and other options at runtime. Perfect for multi-step
                  checkout flows or dynamic pricing scenarios.
                </p>
                <Link
                  to='/embeddable-components/runtime-updates'
                  className='mt-auto'
                >
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <ShoppingCart className='w-5 h-5 text-rose-600' />
                  <CardTitle className='text-base'>Multi-step Checkout</CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  VELVET storefront with embeddable payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Cart, shipping, then payment using paymentCard, saved cards,
                  Google Pay, and Apple Pay with custom appearance rules.
                </p>
                <Link to='/embeddable-components/multi-step-checkout' className='mt-auto'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <Gem className='w-5 h-5 text-indigo-700' />
                  <CardTitle className='text-base'>Jewelry Checkout</CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  LUMIÈRE editorial checkout with ultramarine SDK styling
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Modern jewelry storefront with persistent order sidebar, segmented
                  payment tabs, and built-in saved cards on paymentCard.
                </p>
                <Link to='/embeddable-components/jewelry-checkout' className='mt-auto'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Examples Section */}
        <div className='mb-8 sm:mb-12'>
          <div className='mb-6'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-2'>
              Application Examples
            </h2>
            <p className='text-slate-600'>
              Real-world examples demonstrating how to integrate the payment
              form into your application for common use cases.
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <ShoppingCart className='w-5 h-5 text-blue-600' />
                  <CardTitle className='text-base'>Checkout</CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  Complete checkout flow with payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  A classic e-commerce checkout page featuring an order summary,
                  payment form integration, and complete payment flow. Learn how
                  to integrate the payment form into your checkout process with
                  order details and customer information.
                </p>
                <Link to='/examples/checkout' className='mt-auto'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <CreditCard className='w-5 h-5 text-blue-600' />
                  <CardTitle className='text-base'>Verify Card</CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  Verify and manage saved payment cards
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Save and manage customer payment cards for faster checkout.
                  This example demonstrates zero-amount card verification,
                  displaying saved cards, and managing card deletion. Perfect
                  for implementing saved payment methods in your application.
                </p>
                <Link to='/examples/verify-card' className='mt-auto'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <Layers className='w-5 h-5 text-blue-600' />
                  <CardTitle className='text-base'>Embedded Checkout</CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  Embed a full checkout experience inline on your page
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Embed a complete checkout flow directly within your page
                  without redirecting customers away. This example shows how to
                  integrate an inline checkout experience with order management,
                  saved cards, and seamless payment processing.
                </p>
                <Link to='/examples/embedded-checkout' className='mt-auto'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-2 border-slate-200 hover:border-blue-300 transition-colors flex flex-col h-full'>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <Layers className='w-5 h-5 text-blue-600' />
                  <CardTitle className='text-base'>Custom CTA</CardTitle>
                </div>
                <CardDescription className='text-xs mb-3'>
                  Branded pay button with validate() and submit()
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1 space-y-3'>
                <p className='text-sm text-slate-600'>
                  Hide the iframe submit button and drive checkout with your own
                  complete-purchase CTA. Typical pattern for embeddable
                  paymentCard layouts.
                </p>
                <Link to='/examples/custom-cta' className='mt-auto'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-between group'
                  >
                    <span>View Example</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className='border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <h3 className='text-xl font-semibold text-slate-900 mb-2'>
                Ready to Get Started?
              </h3>
              <p className='text-slate-600 mb-6 max-w-xl mx-auto'>
                Configure your API credentials and start exploring the examples
                to see how easy it is to integrate xMoney.
              </p>
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <p className='text-sm text-slate-600'>
                  Click the{' '}
                  <span className='font-medium text-slate-900'>
                    Setup API
                  </span>{' '}
                  button in the header to configure your credentials, then explore
                  the examples from the header menu.
                </p>
              </div>
              <div className='flex flex-col sm:flex-row gap-3 justify-center mt-4'>
                <Link to='/examples/checkout'>
                  <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                    <PlayCircle className='w-4 h-4 mr-2' />
                    View First Example
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
