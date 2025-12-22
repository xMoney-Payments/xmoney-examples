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

import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'

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
                <div className='px-6 py-4 border-b'>
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
                    Examples
                  </div>
                  <nav className='flex flex-col space-y-1 px-2'>
                    <SheetClose asChild>
                      <Link
                        to='/examples/checkout'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <div className='h-2 w-2 rounded-full bg-blue-500' />
                        Checkout
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to='/examples/verify-card'
                        className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 active:bg-indigo-100'
                      >
                        <div className='h-2 w-2 rounded-full bg-green-500' />
                        Verify Card
                      </Link>
                    </SheetClose>
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link to='/' className='mr-6 flex items-center space-x-2'>
          <img src='/logo.png' alt='xMoney' className='h-8' />
        </Link>
        <div className='mr-4 hidden md:flex'>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Payment Form</NavigationMenuTrigger>
                <NavigationMenuContent>
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
                <NavigationMenuTrigger>Examples</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='grid gap-3 p-4 md:w-[400px]'>
                    <ListItem href='/examples/checkout' title='Checkout'>
                      Classic checkout page with order summary and payment form.
                    </ListItem>
                    <ListItem href='/examples/verify-card' title='Verify Card'>
                      Save and manage cards for later use with zero-amount verification.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
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
