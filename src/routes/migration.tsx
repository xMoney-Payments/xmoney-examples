import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Layout,
  Layers,
  RefreshCw,
  Smartphone,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/migration')({
  component: MigrationPage,
})

function Badge({
  variant,
  children,
}: {
  variant: 'breaking' | 'new' | 'renamed' | 'removed' | 'changed'
  children: React.ReactNode
}) {
  const styles = {
    breaking: 'bg-red-100 text-red-700 border border-red-200',
    new: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    renamed: 'bg-amber-100 text-amber-700 border border-amber-200',
    removed: 'bg-slate-100 text-slate-600 border border-slate-200 line-through',
    changed: 'bg-blue-100 text-blue-700 border border-blue-200',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  )
}

function DiffBlock({ v1, v2 }: { v1: string; v2: string }) {
  return (
    <div className='grid sm:grid-cols-2 gap-3 mt-3'>
      <div className='min-w-0'>
        <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1'>
          v1
        </p>
        <pre className='bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 overflow-x-auto whitespace-pre leading-relaxed'>
          {v1}
        </pre>
      </div>
      <div className='min-w-0'>
        <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1'>
          v2
        </p>
        <pre className='bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 overflow-x-auto whitespace-pre leading-relaxed'>
          {v2}
        </pre>
      </div>
    </div>
  )
}

function ChangeTable({
  rows,
}: {
  rows: { v1: string; v2: string; note?: string }[]
}) {
  return (
    <div className='overflow-x-auto rounded-lg border border-slate-200 mt-3'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='bg-slate-50 border-b border-slate-200 text-left'>
            <th className='px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wide'>
              v1
            </th>
            <th className='px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wide'>
              v2
            </th>
            {rows.some((r) => r.note) && (
              <th className='px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wide'>
                Notes
              </th>
            )}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100'>
          {rows.map((r, i) => (
            <tr key={i} className='hover:bg-slate-50/50 transition-colors'>
              <td className='px-4 py-2.5 font-mono text-xs text-red-700 bg-red-50/50'>
                {r.v1}
              </td>
              <td className='px-4 py-2.5 font-mono text-xs text-emerald-700 bg-emerald-50/50'>
                {r.v2}
              </td>
              {rows.some((row) => row.note) && (
                <td className='px-4 py-2.5 text-xs text-slate-600'>
                  {r.note ?? ''}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NewList({
  items,
}: {
  items: { name: string; note: string; icon?: React.ElementType }[]
}) {
  return (
    <ul className='mt-3 space-y-2'>
      {items.map((item) => {
        const Icon = item.icon ?? CheckCircle2
        return (
          <li
            key={item.name}
            className='flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3'
          >
            <Icon className='mt-0.5 w-4 h-4 text-emerald-600 shrink-0' />
            <div>
              <span className='font-mono text-xs font-semibold text-emerald-800'>
                {item.name}
              </span>
              <p className='text-xs text-emerald-700 mt-0.5'>{item.note}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function MigrationPage() {
  return (
    <div className='min-h-full bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10'>
        {/* Hero */}
        <div className='mb-10'>
          <div className='flex flex-wrap items-center gap-3 mb-4'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white'>
              v1
            </span>
            <ArrowRight className='w-4 h-4 text-slate-400' />
            <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white'>
              v2
            </span>
          </div>
          <h1 className='text-3xl sm:text-4xl font-bold text-slate-900 mb-3'>
            Migration Guide &amp; What's New
          </h1>
          <p className='text-slate-600 text-lg max-w-2xl'>
            v2 introduces a rearchitected SDK with a namespace-based API,
            standalone payment components, and a greatly simplified response
            shape. This page walks through every change.
          </p>
        </div>

        <div className='space-y-6 sm:space-y-10'>
          {/* 1. Global API */}
          <Card className='border-red-200 pt-0'>
            <CardHeader className='pb-3 border-b border-red-100 bg-red-50/60 rounded-t-xl pt-4 sm:pt-6'>
              <div className='flex items-center justify-between flex-col sm:flex-row gap-2'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Layout className='w-4 h-4 text-red-600' />
                  Global API
                </CardTitle>
                <Badge variant='breaking'>Breaking change</Badge>
              </div>
            </CardHeader>
            <CardContent className='pt-5'>
              <p className='text-sm text-slate-600 mb-1'>
                The SDK is no longer a single class on{' '}
                <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                  window.XMoneyPaymentForm
                </code>
                . It is now a namespace object at{' '}
                <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                  window.XMoney
                </code>{' '}
                with a factory method for every payment component.
              </p>
              <DiffBlock
                v1={`declare global {
  interface Window {
    XMoneyPaymentForm: XMoneyPaymentForm;
  }
}`}
                v2={`declare global {
  interface Window {
    XMoney: {
      paymentForm(config): Promise<PaymentFormInstance>;
      paymentCard(config): Promise<PaymentCardInstance>;
      savedCardPayment(config): Promise<SavedCardPaymentInstance>;
      googlePay(config): Promise<GooglePayInstance>;
      applePay(config): Promise<ApplePayInstance>;
      getPaymentMethodCapabilities(): Promise<PaymentMethodCapabilities>;
    };
  }
}`}
              />
            </CardContent>
          </Card>

          {/* 2. Instantiation */}
          <Card className='border-red-200 pt-0'>
            <CardHeader className='pb-3 border-b border-red-100 bg-red-50/60 rounded-t-xl pt-4 sm:pt-6'>
              <div className='flex items-center justify-between flex-col sm:flex-row gap-2'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Zap className='w-4 h-4 text-red-600' />
                  Instantiation is now async
                </CardTitle>
                <Badge variant='breaking'>Breaking change</Badge>
              </div>
            </CardHeader>
            <CardContent className='pt-5'>
              <p className='text-sm text-slate-600 mb-1'>
                The synchronous{' '}
                <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                  new
                </code>{' '}
                constructor is gone. All factory methods return a{' '}
                <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                  Promise
                </code>{' '}
                — you must{' '}
                <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                  await
                </code>{' '}
                them.
              </p>
              <DiffBlock
                v1={`// Synchronous constructor
const form = new window.XMoneyPaymentForm(config);`}
                v2={`// Async factory function
const form = await window.XMoney.paymentForm(config);`}
              />
            </CardContent>
          </Card>

          {/* 3. PaymentFormConfig */}
          <Card className='border-red-200 pt-0'>
            <CardHeader className='pb-3 border-b border-red-100 bg-red-50/60 rounded-t-xl pt-4 sm:pt-6'>
              <div className='flex items-center justify-between flex-col sm:flex-row gap-2'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <CreditCard className='w-4 h-4 text-red-600' />
                  PaymentFormConfig — full comparison
                </CardTitle>
                <Badge variant='breaking'>Breaking change</Badge>
              </div>
            </CardHeader>
            <CardContent className='pt-5 space-y-8'>
              <p className='text-sm text-slate-600'>
                The flat{' '}
                <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                  options.*
                </code>{' '}
                bag is split into three namespaces:{' '}
                <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                  card.*
                </code>
                ,{' '}
                <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                  paymentMethods.*
                </code>
                , and a slimmed-down{' '}
                <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                  options.*
                </code>
                .
              </p>

              {/* Base fields — unchanged */}
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'>
                  Base fields — unchanged in both versions
                </p>
                <div className='overflow-x-auto rounded-lg border border-slate-200'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr className='bg-slate-50 border-b text-left'>
                        <th className='px-3 py-2 font-semibold text-slate-600'>
                          Property
                        </th>
                        <th className='px-3 py-2 font-semibold text-slate-600'>
                          Type
                        </th>
                        <th className='px-3 py-2 font-semibold text-slate-600'>
                          Required
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100'>
                      {[
                        {
                          prop: 'container',
                          type: 'string | HTMLElement',
                          req: '✓',
                        },
                        { prop: 'orderPayload', type: 'string', req: '✓' },
                        { prop: 'orderChecksum', type: 'string', req: '✓' },
                        { prop: 'publicKey', type: 'string', req: '✓' },
                        { prop: 'onReady', type: '() => void', req: '' },
                        {
                          prop: 'onError',
                          type: '(err: { code: number; message: string } | string) => void',
                          req: '',
                        },
                        {
                          prop: 'onPaymentComplete',
                          type: '(data: TransactionDetails) => void',
                          req: '',
                        },
                      ].map((r) => (
                        <tr key={r.prop} className='hover:bg-slate-50/50'>
                          <td className='px-3 py-2 font-mono font-semibold text-slate-700'>
                            {r.prop}
                          </td>
                          <td className='px-3 py-2 font-mono text-slate-500'>
                            {r.type}
                          </td>
                          <td className='px-3 py-2 text-center text-emerald-600 font-bold'>
                            {r.req}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Full property diff */}
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'>
                  All properties — side by side
                </p>
                <div className='overflow-x-auto rounded-lg border border-slate-200'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr className='bg-slate-50 border-b text-left'>
                        <th className='px-3 py-2 font-semibold text-slate-600 w-[35%]'>
                          v1 property
                        </th>
                        <th className='px-3 py-2 font-semibold text-slate-600 w-[35%]'>
                          v2 property
                        </th>
                        <th className='px-3 py-2 font-semibold text-slate-600'>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100'>
                      {(
                        [
                          {
                            v1: 'options.appearance.theme',
                            v2: 'options.appearance.theme',
                            status: 'unchanged',
                          },
                          {
                            v1: 'options.appearance.variables',
                            v2: 'options.appearance.variables',
                            status: 'unchanged',
                          },
                          {
                            v1: 'options.appearance.rules',
                            v2: 'options.appearance.rules',
                            status: 'unchanged',
                          },
                          {
                            v1: 'options.locale',
                            v2: 'options.locale',
                            status: 'unchanged',
                          },
                          {
                            v1: 'options.buttonType',
                            v2: 'card.submitButton.type',
                            status: 'moved',
                          },
                          {
                            v1: 'options.validationMode',
                            v2: 'card.validationMode',
                            status: 'moved',
                          },
                          {
                            v1: 'options.enableSavedCards',
                            v2: 'card.savedCards.enabled',
                            status: 'moved',
                          },
                          {
                            v1: 'options.displaySaveCardOption',
                            v2: 'card.savedCards.optInVisible',
                            status: 'moved',
                          },
                          {
                            v1: 'options.displaySubmitButton',
                            v2: 'card.submitButton.visible',
                            status: 'moved',
                          },
                          {
                            v1: 'options.cardHolderVerification',
                            v2: 'card.cardHolderVerification',
                            status: 'moved',
                          },
                          {
                            v1: 'options.googlePay',
                            v2: 'paymentMethods.googlePay',
                            status: 'moved',
                          },
                          {
                            v1: 'options.applePay',
                            v2: 'paymentMethods.applePay',
                            status: 'moved',
                          },
                          {
                            v1: '—',
                            v2: 'card.inputs.grouping',
                            status: 'new',
                          },
                          {
                            v1: 'options.enableBackgroundRefresh',
                            v2: '—',
                            status: 'removed',
                          },
                          {
                            v1: 'onSubmitPending(isPending)',
                            v2: 'onPaymentProcessing(isProcessing)',
                            status: 'renamed',
                          },
                        ] as {
                          v1: string
                          v2: string
                          status:
                            | 'unchanged'
                            | 'moved'
                            | 'removed'
                            | 'renamed'
                            | 'new'
                        }[]
                      ).map((r, i) => {
                        const statusStyle = {
                          unchanged: 'bg-slate-100 text-slate-600',
                          moved: 'bg-amber-100 text-amber-700',
                          removed: 'bg-red-100 text-red-700',
                          renamed: 'bg-purple-100 text-purple-700',
                          new: 'bg-emerald-100 text-emerald-700',
                        }[r.status]
                        return (
                          <tr key={i} className='hover:bg-slate-50/40'>
                            <td
                              className={`px-3 py-2 font-mono ${r.status === 'removed' ? 'line-through text-slate-400' : 'text-red-700 bg-red-50/40'}`}
                            >
                              {r.v1}
                            </td>
                            <td
                              className={`px-3 py-2 font-mono ${r.v2 === '—' ? 'text-slate-400' : 'text-emerald-700 bg-emerald-50/40'}`}
                            >
                              {r.v2}
                            </td>
                            <td className='px-3 py-2'>
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle}`}
                              >
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Full type diff */}
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'>
                  Full type definition diff
                </p>
                <DiffBlock
                  v1={`
interface PaymentFormConfig{
  options?: {
    // Appearance
    appearance?: {
      theme?: "light" | "dark" | "custom"
      variables?: Record<string, string>
      rules?: Record<string, Record<string, string>>
    }
    // Card behaviour
    buttonType?: "book" | "buy" | "checkout" | "donate"
               | "order" | "pay" | "subscribe" | "topUp"
    validationMode?: "onSubmit" | "onChange" | "onBlur" | "onTouched"
    locale?: "en-US" | "el-GR" | "ro-RO" | "bg-BG" | "hu-HU" | "pl-PL"
    enableSavedCards?: boolean
    enableBackgroundRefresh?: boolean
    displaySaveCardOption?: boolean
    displaySubmitButton?: boolean
    // Card holder verification
    cardHolderVerification?: {
      name: { firstName: string; middleName: string; lastName: string }
      onCardHolderVerification: (result: CardHolderVerificationResult) => boolean
    }
    // Wallets
    googlePay?: {
      enabled?: boolean
      appearance?: {
        color?: "white" | "black"
        radius?: number
        type?: "book" | "buy" | "checkout" | "donate"
              | "order" | "plain" | "pay" | "subscribe"
        borderType?: "default_border" | "no_border"
      }
    }
    applePay?: {
      enabled?: boolean
      appearance?: {
        style?: "white" | "black" | "white-outline"
        radius?: number
        type?: "add-money" | "book" | "buy" | "checkout"
              | "contribute" | "continue" | "donate" | "order"
              | "plain" | "pay" | "reload" | "rent" | "set-up"
              | "subscribe" | "support" | "tip" | "top-up"
      }
    }
  }
  onSubmitPending?: (isPending: boolean) => void
}`}
                  v2={`
interface PaymentFormConfig  {
  card?: {
    validationMode?: "onSubmit" | "onChange" | "onBlur" | "onTouched"
    savedCards?: {
      enabled?: boolean
      optInVisible?: boolean
    }
    submitButton?: {
      visible?: boolean
      type?: "book" | "buy" | "checkout" | "donate"
            | "order" | "pay" | "subscribe" | "topUp"
    }
    cardHolderVerification?: {
      name: { firstName: string; middleName: string; lastName: string }
      onCardHolderVerification: (result: CardHolderVerificationResult) => boolean
    }
  }
  options?: {
    appearance?: {
      theme?: "light" | "dark" | "custom"
      variables?: Record<string, string>
      rules?: Record<string, Record<string, string>>
    }
    locale?: "en-US" | "el-GR" | "ro-RO" | "bg-BG" | "hu-HU" | "pl-PL"
  }
  paymentMethods?: {
    googlePay?: {
      enabled?: boolean
      appearance?: {
        color?: "white" | "black"
        radius?: number
        type?: "book" | "buy" | "checkout" | "donate"
              | "order" | "plain" | "pay" | "subscribe"
        borderType?: "default_border" | "no_border"
      }
    }
    applePay?: {
      enabled?: boolean
      appearance?: {
        style?: "white" | "black" | "white-outline"
        radius?: number
        type?: "add-money" | "book" | "buy" | "checkout"
              | "contribute" | "continue" | "donate" | "order"
              | "plain" | "pay" | "reload" | "rent" | "set-up"
              | "subscribe" | "support" | "tip" | "top-up"
      }
    }
  }
  onPaymentProcessing?: (isProcessing: boolean) => void

}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. PaymentFormInstance */}
          <Card className='border-amber-200 pt-0'>
            <CardHeader className='pb-3 border-b border-amber-100 bg-amber-50/60 rounded-t-xl pt-4 sm:pt-6'>
              <div className='flex items-center justify-between flex-col sm:flex-row gap-2'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Zap className='w-4 h-4 text-amber-600' />
                  PaymentFormInstance — full comparison
                </CardTitle>
                <div className='flex gap-2'>
                  <Badge variant='new'>New method</Badge>
                  <Badge variant='changed'>Changed</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-5 space-y-6'>
              <p className='text-sm text-slate-600'>
                The instance shape is mostly the same.
              </p>

              {/* Method comparison table */}
              <div className='overflow-x-auto rounded-lg border border-slate-200'>
                <table className='w-full text-xs'>
                  <thead>
                    <tr className='bg-slate-50 border-b text-left'>
                      <th className='px-3 py-2 font-semibold text-slate-600 w-[25%]'>
                        Method
                      </th>
                      <th className='px-3 py-2 font-semibold text-slate-600 w-[32%]'>
                        v1 signature
                      </th>
                      <th className='px-3 py-2 font-semibold text-slate-600 w-[32%]'>
                        v2 signature
                      </th>
                      <th className='px-3 py-2 font-semibold text-slate-600'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {(
                      [
                        {
                          method: 'updateOrder',
                          v1: '({ orderPayload: string, orderChecksum: string }) => void',
                          v2: '({ orderPayload: string, orderChecksum: string }) => void',
                          status: 'unchanged',
                        },
                        {
                          method: 'close',
                          v1: '() => void',
                          v2: '-',
                          status: 'removed',
                        },
                        {
                          method: 'destroy',
                          v1: '() => void',
                          v2: '() => void',
                          status: 'unchanged',
                        },
                        {
                          method: 'updateLocale',
                          v1: '(locale: "en-US" | "el-GR" | "ro-RO" | "bg-BG" | "hu-HU" | "pl-PL") => void',
                          v2: '(locale: "en-US" | "el-GR" | "ro-RO" | "bg-BG" | "hu-HU" | "pl-PL") => void',
                          status: 'unchanged',
                        },
                        {
                          method: 'updateAppearance',
                          v1: '(appearance: { theme?: "light"|"dark"|"custom", variables?: Record<string,string>, rules?: Record<string, Record<string,string>> }) => void',
                          v2: '(appearance: { theme?: "light"|"dark"|"custom", variables?: Record<string,string>, rules?: Record<string, Record<string,string>> }) => void',
                          status: 'unchanged',
                        },
                        {
                          method: 'submit',
                          v1: '() => void',
                          v2: '() => void',
                          status: 'unchanged',
                        },
                        {
                          method: 'validate',
                          v1: '— (not available)',
                          v2: '() => { isValid: boolean; errors: Record<string, string> }',
                          status: 'new',
                        },
                      ] as {
                        method: string
                        v1: string
                        v2: string
                        status: 'unchanged' | 'changed' | 'new' | 'removed'
                      }[]
                    ).map((r) => {
                      const statusStyle = {
                        unchanged: 'bg-slate-100 text-slate-600',
                        changed: 'bg-amber-100 text-amber-700',
                        new: 'bg-emerald-100 text-emerald-700',
                        removed: 'bg-red-100 text-red-700',
                      }[r.status]
                      return (
                        <tr
                          key={r.method}
                          className='hover:bg-slate-50/40 align-top'
                        >
                          <td className='px-3 py-2.5 font-mono font-semibold text-slate-700'>
                            {r.method}
                          </td>
                          <td
                            className={`px-3 py-2.5 font-mono ${r.v1 === '— (not available)' ? 'text-slate-400 italic' : 'text-red-700 bg-red-50/40'}`}
                          >
                            {r.v1}
                          </td>
                          <td className='px-3 py-2.5 font-mono text-emerald-700 bg-emerald-50/40'>
                            {r.v2}
                          </td>
                          <td className='px-3 py-2.5'>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle}`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Full type diff */}
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'>
                  Full type definition diff
                </p>
                <DiffBlock
                  v1={`
interface PaymentFormInstance {
  updateOrder({ orderPayload: string, orderChecksum: string }): void
  close(): void
  destroy(): void

  updateLocale(locale: "en-US" | "el-GR" | "ro-RO" | "bg-BG" | "hu-HU" | "pl-PL"): void
  updateAppearance(appearance: {
    theme?: "light" | "dark" | "custom"
    variables?: Record<string, string>
    rules?: Record<string, Record<string, string>>
  }): void
  submit(): void
  // validate() — does not exist in v1
}`}
                  v2={`
interface PaymentFormInstance extends BaseInstance {
  updateOrder({ orderPayload: string, orderChecksum: string }): void
  destroy(): void

  updateLocale(locale: "en-US" | "el-GR" | "ro-RO" | "bg-BG" | "hu-HU" | "pl-PL"): void
  updateAppearance(appearance: {
    theme?: "light" | "dark" | "custom"
    variables?: Record<string, string>
    rules?: Record<string, Record<string, string>>
  }): void
  submit(): void

  // NEW in v2:
  validate(): {
    isValid: boolean
    errors: Record<string, { message: string, code: number }>
  }
}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* 5. TransactionDetails */}
          <Card className='border-red-200 pt-0'>
            <CardHeader className='pb-3 border-b border-red-100 bg-red-50/60 rounded-t-xl pt-4 sm:pt-6'>
              <div className='flex items-center justify-between flex-col sm:flex-row gap-2'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <RefreshCw className='w-4 h-4 text-red-600' />
                  TransactionDetails shape
                </CardTitle>
                <Badge variant='breaking'>Breaking change</Badge>
              </div>
            </CardHeader>
            <CardContent className='pt-5 space-y-5'>
              <p className='text-sm text-slate-600'>
                The object passed to{' '}
                <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                  onPaymentComplete
                </code>{' '}
                has been significantly slimmed down.
              </p>
              <DiffBlock
                v1={`interface TransactionDetails {
  id: number
  siteId: number
  orderId: number
  customerId: number
  transactionType: TransactionTypeEnum
  transactionMethod: TransactionMethodEnum
  transactionStatus: TransactionStatusEnum
  ip: string | null
  amount: string          // string ⚠
  currency: string
  amountInEur: string     // string ⚠
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
}`}
                v2={`interface TransactionDetails {
  id: number
  transactionStatus: TransactionStatusEnum
  amount: number          // number ✓
  currencyKey: string     // renamed ✓
  amountInEuro: number    // renamed + number ✓
  customerData: TransactionCustomerData
  externalOrderId: string // new ✓
  description: string
}`}
              />
            </CardContent>
          </Card>

          {/* What's New */}
          <div>
            <div className='flex items-center gap-2 mb-6'>
              <Sparkles className='w-5 h-5 text-emerald-600' />
              <h2 className='text-xl font-semibold text-emerald-800'>
                What's New in v2
              </h2>
            </div>
            <div className='space-y-6'>
              <Card className='border-emerald-200 pt-0'>
                <CardHeader className='pb-3 border-b border-emerald-100 bg-emerald-50/60 rounded-t-xl pt-4 sm:pt-6'>
                  <div className='flex items-center justify-between flex-col sm:flex-row gap-2'>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <Layers className='w-4 h-4 text-emerald-600' />
                      Four new standalone components
                    </CardTitle>
                    <Badge variant='new'>New in v2</Badge>
                  </div>
                </CardHeader>
                <CardContent className='pt-5'>
                  <p className='text-sm text-slate-600 mb-3'>
                    Each component follows the same{' '}
                    <code className='text-xs bg-slate-100 rounded px-1 py-0.5'>
                      XMoneyBaseConfig
                    </code>{' '}
                    contract and is independently mountable.
                  </p>
                  <NewList
                    items={[
                      {
                        icon: CreditCard,
                        name: 'XMoney.paymentCard',
                        note: 'Standalone card-only element. Exposes updateLocale, updateAppearance, submit, validate.',
                      },
                      {
                        icon: Smartphone,
                        name: 'XMoney.googlePay',
                        note: 'Standalone Google Pay button with configurable colour, radius, and button type.',
                      },
                      {
                        icon: Smartphone,
                        name: 'XMoney.applePay',
                        note: 'Standalone Apple Pay button with configurable style, radius, and button type.',
                      },
                      {
                        icon: Wallet,
                        name: 'XMoney.savedCardPayment',
                        note: 'Programmatic saved-card charge. No container needed. Call saved.pay({ cardId }) to trigger.',
                      },
                    ]}
                  />
                  <pre className='mt-4 bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-x-auto leading-relaxed'>
                    {`const card  = await XMoney.paymentCard(config);
const gPay  = await XMoney.googlePay(config);
const aPay  = await XMoney.applePay(config);
const saved = await XMoney.savedCardPayment(config);
saved.pay({ cardId: 42 });`}
                  </pre>
                </CardContent>
              </Card>

              <Card className='border-emerald-200 pt-0'>
                <CardHeader className='pb-3 border-b border-emerald-100 bg-emerald-50/60 rounded-t-xl pt-4 sm:pt-6'>
                  <div className='flex items-center justify-between flex-col sm:flex-row gap-2'>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <Zap className='w-4 h-4 text-emerald-600' />
                      Payment method capability detection
                    </CardTitle>
                    <Badge variant='new'>New in v2</Badge>
                  </div>
                </CardHeader>
                <CardContent className='pt-5'>
                  <p className='text-sm text-slate-600 mb-3'>
                    Query browser/device support for wallet methods before
                    rendering buttons.
                  </p>
                  <pre className='bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-x-auto leading-relaxed'>
                    {`const caps = await XMoney.getPaymentMethodCapabilities();
// {
//   googlePay: { supported: boolean, reason?: string },
//   applePay:  { supported: boolean, reason?: string }
// }`}
                  </pre>
                </CardContent>
              </Card>

              <Card className='border-emerald-200 pt-0'>
                <CardHeader className='pb-3 border-b border-emerald-100 bg-emerald-50/60 rounded-t-xl pt-4 sm:pt-6'>
                  <div className='flex items-center justify-between flex-col sm:flex-row gap-2'>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <CheckCircle2 className='w-4 h-4 text-emerald-600' />
                      <code className='font-mono text-sm'>validate()</code> on
                      form &amp; card instances
                    </CardTitle>
                    <Badge variant='new'>New in v2</Badge>
                  </div>
                </CardHeader>
                <CardContent className='pt-5 space-y-3'>
                  <p className='text-sm text-slate-600'>
                    Trigger field validation independently from submission.
                  </p>
                  <ChangeTable
                    rows={[
                      {
                        v1: '— (not available)',
                        v2: 'PaymentFormInstance.validate()\n→ { isValid, errors: Record<string, { message: string, code: string }> }',
                        note: 'Synchronous on the form instance',
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Checklist */}
          <Card className='border-blue-200 pt-0 bg-gradient-to-br from-blue-50 to-slate-50'>
            <CardHeader className='pb-3 border-b border-blue-100 rounded-t-xl pt-4 sm:pt-6'>
              <CardTitle className='text-base flex items-center gap-2 text-blue-800'>
                <CheckCircle2 className='w-4 h-4' />
                Migration checklist
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-5'>
              <ul className='space-y-2.5'>
                {[
                  'Replace window.XMoneyPaymentForm with window.XMoney.paymentForm',
                  'Await the factory call — remove the new keyword',
                  'Rename onSubmitPending → onPaymentProcessing',
                  'Remove options.enableBackgroundRefresh',
                  'Update close() calls to destroy()',
                  'Move card options into the card.* namespace',
                  'Move wallet options into the paymentMethods.* namespace',
                  'Update onPaymentComplete handler: amount and amountInEuro are now numbers; field is currencyKey not currency',
                  'Optionally adopt standalone components (paymentCard, googlePay, applePay, savedCardPayment)',
                  'Optionally call getPaymentMethodCapabilities() to conditionally show wallet buttons',
                ].map((item, i) => (
                  <li key={i} className='flex items-start gap-3'>
                    <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-blue-300 bg-white text-xs font-bold text-blue-600'>
                      {i + 1}
                    </span>
                    <span className='text-sm text-slate-700'>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
