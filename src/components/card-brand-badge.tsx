export function CardBrandBadge({ type }: { type: string }) {
  const brand = type.toLowerCase()
  if (brand === 'visa') {
    return (
      <span className='rounded border border-blue-200 bg-blue-50 px-1 py-0.5 text-[10px] font-extrabold tracking-tight text-blue-700'>
        VISA
      </span>
    )
  }
  if (brand === 'mastercard') {
    return (
      <span className='flex items-center'>
        <span className='-mr-2.5 inline-block h-4 w-4 rounded-full bg-red-500 opacity-90' />
        <span className='inline-block h-4 w-4 rounded-full bg-yellow-400 opacity-90' />
      </span>
    )
  }
  return (
    <span className='rounded bg-slate-100 px-1 py-0.5 text-[10px] font-bold text-slate-500'>
      {type.toUpperCase()}
    </span>
  )
}
