import {
  Home,
  Inbox,
  Settings,
  ShoppingCart,
  RefreshCw,
  UserSquare2,
  ArrowUpCircle,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

// Menu items.
const items = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Inline Checkout',
    url: '/inline-checkout',
    icon: Inbox,
  },
  {
    title: 'Payment Form Configuration',
    url: '/payment-form/configuration',
    icon: Settings,
  },
  {
    title: 'Card Holder Verification',
    url: '/payment-form/card-holder-verification',
    icon: UserSquare2,
  },
  {
    title: 'Runtime Updates',
    url: '/payment-form/runtime-updates',
    icon: RefreshCw,
  },
  {
    title: 'Checkout',
    url: '/examples/checkout',
    icon: ShoppingCart,
  },
]

const docsItems = [
  {
    title: 'Migration v1 → v2',
    url: '/migration',
    icon: ArrowUpCircle,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Examples</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Documentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {docsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
