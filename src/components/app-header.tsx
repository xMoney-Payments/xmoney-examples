import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { ApiSettings } from './api-settings'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

import {
  Menu,
  ShoppingCart,
  CreditCard,
  LayoutTemplate,
  ArrowUpCircle,
  Gem,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'>
      <div className='w-full flex h-14 items-center px-4'>
        {/* Mobile Menu Trigger */}
        <div className='mr-2 md:hidden'>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger className='p-2 -ml-2 rounded-md hover:bg-slate-100 transition-colors'>
              <Menu className='h-5 w-5 text-slate-600' />
            </SheetTrigger>
            <SheetContent side='left' className='w-[80%] sm:w-[350px] p-0'>
              <div className='flex flex-col h-full bg-white'>
                <div className='border-b px-4 py-3 sm:px-6 sm:py-4'>
                  <SheetClose asChild>
                    <Link to='/' className='flex items-center space-x-2'>
                      <img src='/logo.png' alt='xMoney' className='h-8' />
                    </Link>
                  </SheetClose>
                </div>
                <div className='flex-1 overflow-y-auto py-4'>
                  <div className='px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                    Payment Form
                  </div>
                  <nav className='flex flex-col space-y-1 px-2'>
                    <SheetClose asChild>
                      <Link
                        to='/payment-form/configuration'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <div className='h-2 w-2 rounded-full bg-indigo-500' />
                        Configuration
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to='/payment-form/runtime-updates'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <div className='h-2 w-2 rounded-full bg-purple-500' />
                        Runtime Updates
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to='/payment-form/card-holder-verification'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <div className='h-2 w-2 rounded-full bg-emerald-500' />
                        Card Holder Verification
                      </Link>
                    </SheetClose>
                  </nav>
                  <div className='px-4 mb-2 mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                    Embeddable Components
                  </div>
                  <nav className='flex flex-col space-y-1 px-2'>
                    <SheetClose asChild>
                      <Link
                        to='/embeddable-components/configuration'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <div className='h-2 w-2 rounded-full bg-indigo-500' />
                        Configuration
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to='/embeddable-components/runtime-updates'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <div className='h-2 w-2 rounded-full bg-purple-500' />
                        Runtime Updates
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to='/embeddable-components/card-holder-verification'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <div className='h-2 w-2 rounded-full bg-emerald-500' />
                        Card Holder Verification
                      </Link>
                    </SheetClose>
                  </nav>
                  <div className='px-4 mb-2 mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                    Examples
                  </div>
                  <nav className='flex flex-col space-y-1 px-2'>
                    <div className='flex items-center gap-2 px-3 mb-1'>
                      <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold'>
                        <CreditCard className='h-3 w-3' />
                        Payment Form
                      </span>
                    </div>
                    <SheetClose asChild>
                      <Link
                        to='/examples/checkout'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <ShoppingCart className='h-4 w-4 text-blue-500' />
                        Checkout
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to='/examples/verify-card'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <CreditCard className='h-4 w-4 text-emerald-500' />
                        Verify Card
                      </Link>
                    </SheetClose>
                    <div className='flex items-center gap-2 px-3 mt-4 mb-1'>
                      <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold'>
                        <LayoutTemplate className='h-3 w-3' />
                        Embeddable Components
                      </span>
                    </div>
                    <SheetClose asChild>
                      <Link
                        to='/embeddable-components/jewelry-checkout'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <Gem className='h-4 w-4 text-indigo-700' />
                        Jewelry Checkout
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to='/embeddable-components/multi-step-checkout'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <ShoppingCart className='h-4 w-4 text-rose-600' />
                        Multi-step Checkout
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to='/examples/embedded-checkout'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <LayoutTemplate className='h-4 w-4 text-purple-500' />
                        Embedded Checkout
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to='/examples/custom-cta'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <LayoutTemplate className='h-4 w-4 text-fuchsia-500' />
                        Custom CTA
                      </Link>
                    </SheetClose>
                  </nav>
                  <div className='px-4 mb-2 mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                    Documentation
                  </div>
                  <nav className='flex flex-col space-y-1 px-2'>
                    <SheetClose asChild>
                      <Link
                        to='/migration'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 active:bg-blue-100'
                      >
                        <ArrowUpCircle className='h-4 w-4 text-blue-500' />
                        Migration v1 → v2
                      </Link>
                    </SheetClose>
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link to='/' className='mr-2 flex shrink-0 items-center space-x-2 md:mr-6'>
          <img src='/logo.png' alt='xMoney' className='h-8' />
        </Link>
        <div className='mr-4 hidden md:flex'>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  onPointerEnter={(e) => e.preventDefault()}
                  onPointerMove={(e) => e.preventDefault()}
                  onPointerLeave={(e) => e.preventDefault()}
                >
                  Payment Form
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  onPointerLeave={(e) => e.preventDefault()}
                >
                  <ul className='grid gap-3 p-4 md:w-[400px]'>
                    <ListItem
                      href='/payment-form/configuration'
                      title='Configuration'
                    >
                      Customize the payment form appearance and behavior.
                    </ListItem>
                    <ListItem
                      href='/payment-form/runtime-updates'
                      title='Runtime Updates'
                    >
                      Update order, locale, and appearance without reloading.
                    </ListItem>
                    <ListItem
                      href='/payment-form/card-holder-verification'
                      title='Card Holder Verification'
                    >
                      Showcase of cardholder verification logic and events.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  onPointerEnter={(e) => e.preventDefault()}
                  onPointerMove={(e) => e.preventDefault()}
                  onPointerLeave={(e) => e.preventDefault()}
                >
                  Embeddable Components
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  onPointerLeave={(e) => e.preventDefault()}
                >
                  <ul className='grid gap-3 p-4 md:w-[400px]'>
                    <ListItem
                      href='/embeddable-components/configuration'
                      title='Configuration'
                    >
                      Customize the embeddable components appearance and
                      behavior.
                    </ListItem>
                    <ListItem
                      href='/embeddable-components/runtime-updates'
                      title='Runtime Updates'
                    >
                      Update order, locale, and appearance without reloading.
                    </ListItem>
                    <ListItem
                      href='/embeddable-components/card-holder-verification'
                      title='Card Holder Verification'
                    >
                      Showcase of cardholder verification logic and events.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  onPointerEnter={(e) => e.preventDefault()}
                  onPointerMove={(e) => e.preventDefault()}
                  onPointerLeave={(e) => e.preventDefault()}
                >
                  Examples
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  onPointerLeave={(e) => e.preventDefault()}
                >
                  <div className='w-[520px] p-5'>
                    {/* Payment Form examples */}
                    <div className='mb-5'>
                      <div className='flex items-center gap-2 mb-3'>
                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold'>
                          <CreditCard className='h-3 w-3' />
                          Payment Form
                        </span>
                      </div>
                      <ul className='grid grid-cols-2 gap-2'>
                        <ExampleListItem
                          href='/examples/checkout'
                          title='Checkout'
                          icon={ShoppingCart}
                          iconColor='text-blue-500'
                          iconBg='bg-blue-50'
                        >
                          Classic checkout with order summary and payment form.
                        </ExampleListItem>
                        <ExampleListItem
                          href='/examples/verify-card'
                          title='Verify Card'
                          icon={CreditCard}
                          iconColor='text-emerald-500'
                          iconBg='bg-emerald-50'
                        >
                          Zero-amount card verification and save for later use.
                        </ExampleListItem>
                      </ul>
                    </div>
                    {/* Embeddable Components examples */}
                    <div className='pt-4 border-t border-slate-100'>
                      <div className='flex items-center gap-2 mb-3'>
                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold'>
                          <LayoutTemplate className='h-3 w-3' />
                          Embeddable Components
                        </span>
                      </div>
                      <ul className='grid grid-cols-2 gap-2'>
                        <ExampleListItem
                          href='/embeddable-components/jewelry-checkout'
                          title='Jewelry Checkout'
                          icon={Gem}
                          iconColor='text-indigo-700'
                          iconBg='bg-indigo-50'
                        >
                          LUMIÈRE editorial layout with ultramarine styling and
                          SDK saved cards on paymentCard.
                        </ExampleListItem>
                        <ExampleListItem
                          href='/embeddable-components/multi-step-checkout'
                          title='Multi-step Checkout'
                          icon={ShoppingCart}
                          iconColor='text-rose-600'
                          iconBg='bg-rose-50'
                        >
                          Branded cart-to-payment flow with all embeddable
                          methods.
                        </ExampleListItem>
                        <ExampleListItem
                          href='/examples/embedded-checkout'
                          title='Embedded Checkout'
                          icon={LayoutTemplate}
                          iconColor='text-purple-500'
                          iconBg='bg-purple-50'
                        >
                          Full embedded checkout experience using multiple
                          XMoney components.
                        </ExampleListItem>
                        <ExampleListItem
                          href='/examples/custom-cta'
                          title='Custom CTA'
                          icon={LayoutTemplate}
                          iconColor='text-fuchsia-500'
                          iconBg='bg-fuchsia-50'
                        >
                          Hidden submit button with validate() and submit().
                        </ExampleListItem>
                      </ul>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to='/migration'
                    className='group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 gap-1.5'
                  >
                    <ArrowUpCircle className='h-3.5 w-3.5 text-blue-600' />
                    Migration v1 → v2
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className='ml-auto flex min-w-0 shrink items-center gap-2 md:gap-4'>
          <ApiSettings />
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          to={href as string}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm focus:bg-indigo-50 focus:text-indigo-700',
            className
          )}
          {...props}
        >
          <div className='text-sm font-medium leading-none'>{title}</div>
          <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'

type ExampleListItemProps = {
  href: string
  title: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  children: React.ReactNode
}

const ExampleListItem = ({
  href,
  title,
  icon: Icon,
  iconColor,
  iconBg,
  children,
}: ExampleListItemProps) => (
  <li>
    <NavigationMenuLink asChild>
      <Link
        to={href}
        className='flex items-start gap-3 select-none rounded-lg p-3 no-underline outline-none transition-all duration-200 hover:bg-slate-50 hover:shadow-sm focus:bg-slate-50 group border border-transparent hover:border-slate-200'
      >
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
            iconBg
          )}
        >
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
        <div>
          <div className='text-sm font-semibold leading-none text-slate-800 group-hover:text-slate-900 mb-1.5'>
            {title}
          </div>
          <p className='line-clamp-2 text-xs leading-snug text-slate-500'>
            {children}
          </p>
        </div>
      </Link>
    </NavigationMenuLink>
  </li>
)
