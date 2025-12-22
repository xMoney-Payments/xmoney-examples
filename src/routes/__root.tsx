import { Outlet, createRootRoute } from '@tanstack/react-router'
import { AppHeader } from '@/components/app-header'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className='min-h-screen bg-background font-sans antialiased'>
      <AppHeader />
      <main className='flex-1'>
        <Outlet />
      </main>
    </div>
  )
}
