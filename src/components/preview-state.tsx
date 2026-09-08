import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PreviewState({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center p-4 text-center duration-300 animate-in zoom-in-95 sm:p-6 md:p-8',
        className
      )}
    >
      {children}
    </div>
  )
}
