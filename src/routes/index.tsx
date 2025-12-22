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
        <div className='text-center mb-12'>
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
        <div className='mb-12'>
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
                  Browse interactive examples from the sidebar and see live
                  implementations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-slate-600 mb-4'>
                  Each example includes a live demo, source code, and
                  documentation. Use the sidebar navigation to explore different
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

        {/* Payment Form Features Section */}
        <div className='mb-12'>
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

        {/* Application Examples Section */}
        <div className='mb-12'>
          <div className='mb-6'>
            <h2 className='text-2xl font-semibold text-slate-900 mb-2'>
              Application Examples
            </h2>
            <p className='text-slate-600'>
              Real-world examples demonstrating how to integrate the payment
              form into your application for common use cases.
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
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
                  the examples from the sidebar.
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
