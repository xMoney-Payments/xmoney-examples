import { useState } from 'react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Check, Copy, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const MastercardIcon = () => (
    <img src="/mastercard_symbol.svg" alt="Mastercard" className="w-8 h-5 object-contain" />
)

const VisaIcon = () => (
    <img src="/visa_blue.png" alt="Visa" className="w-8 h-5 object-contain" />
)

const StatusBadge = ({ result }: { result: string }) => {
    const isSuccess = result.toLowerCase().includes('success')
    const label = result

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap transition-colors',
                isSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
            )}
        >
            <span className={cn("w-1.5 h-1.5 rounded-full", isSuccess ? "bg-emerald-500" : "bg-red-500")} />
            {label}
        </span>
    )
}

export function TestCards() {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 1500)
    }

    const cards = [
        {
            brand: 'Mastercard',
            icon: <MastercardIcon />,
            number: '5555 5555 5555 5599',
            expiry: '12/34',
            cvv: '123',
            code: '00000',
            result: 'Success (3DS2)',
        },
        {
            brand: 'Visa',
            icon: <VisaIcon />,
            number: '4111 1111 1111 1111',
            expiry: '12/26',
            cvv: '123',
            code: '00000',
            result: 'Success (3DS2 Frictionless)',
        },
        {
            brand: 'Mastercard',
            icon: <MastercardIcon />,
            number: '5168 4948 9505 5780',
            expiry: '12/26',
            cvv: '123',
            code: '00000',
            result: 'Fail (3DS2 Frictionless)',
        },
        {
            brand: 'Visa',
            icon: <VisaIcon />,
            number: '4000 0011 1111 1118',
            expiry: '12/30',
            cvv: '123',
            code: '00000',
            result: 'Success (3DS2 Attempt)',
        },
    ]

    return (
        <Sheet>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className='text-gray-500 hover:text-gray-900 transition-colors'
                            >
                                <CreditCard className='w-5 h-5' />
                                <span className="sr-only">View Test Cards</span>
                            </Button>
                        </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Test Cards</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <SheetContent
                className='w-full sm:w-[600px] md:w-[850px] md:max-w-none overflow-y-auto bg-white p-0 flex flex-col'
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <div className="p-4 sm:p-6 pb-4 flex-1">
                    <SheetHeader className='mb-4 space-y-1.5'>
                        <SheetTitle className="text-xl sm:text-2xl font-bold tracking-tight">Test Cards</SheetTitle>
                        <SheetDescription className="text-sm sm:text-base text-gray-500">
                            Use these cards to simulate various payment scenarios and 3DS flows.
                        </SheetDescription>
                    </SheetHeader>

                    <div className='border bg-white shadow-sm overflow-x-auto'>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent bg-gray-50/40 border-b border-gray-100">
                                    <TableHead className="w-[60px] sm:w-[80px] h-9 text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-gray-500 pl-3 sm:pl-4">Brand</TableHead>
                                    <TableHead className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-gray-500 min-w-[180px]">Card Number</TableHead>
                                    <TableHead className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-gray-500 whitespace-nowrap">Expiry</TableHead>
                                    <TableHead className="text-[10px] sm:text-xs text-right uppercase tracking-wider font-semibold text-gray-500 whitespace-nowrap">CVV</TableHead>
                                    <TableHead className="text-right text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-gray-500 whitespace-nowrap">3DS Code</TableHead>
                                    <TableHead className="text-right text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-gray-500 pr-3 sm:pr-4 whitespace-nowrap">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cards.map((card, i) => (
                                    <TableRow key={i} className="group hover:bg-gray-50/50 transition-colors border-gray-100">
                                        <TableCell className="pl-3 sm:pl-4 py-2 sm:py-2.5">
                                            <div className="flex items-center justify-center w-10 h-7 sm:w-12 sm:h-8 bg-white border border-gray-100 rounded-md shadow-sm" title={card.brand}>
                                                {card.icon}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2 sm:py-2.5">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <span className="font-mono text-xs sm:text-[14px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors select-all break-all">
                                                    {card.number}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(card.number, i)}
                                                    className={cn(
                                                        "p-1 sm:p-1.5 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 flex-shrink-0",
                                                        copiedIndex === i
                                                            ? "text-emerald-600 bg-emerald-50"
                                                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                                    )}
                                                    title="Copy number"
                                                >
                                                    {copiedIndex === i ? (
                                                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    ) : (
                                                        <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs sm:text-sm text-gray-500 group-hover:text-gray-700 py-2 sm:py-2.5 whitespace-nowrap">{card.expiry}</TableCell>
                                        <TableCell className="font-mono text-xs sm:text-sm text-right text-gray-500 group-hover:text-gray-700 py-2 sm:py-2.5 whitespace-nowrap">{card.cvv}</TableCell>
                                        <TableCell className="font-mono text-xs sm:text-sm text-right text-gray-500 group-hover:text-gray-700 py-2 sm:py-2.5 whitespace-nowrap">{card.code}</TableCell>
                                        <TableCell className="text-right pr-3 sm:pr-4 py-2 sm:py-2.5">
                                            <div className="flex justify-end">
                                                <StatusBadge result={card.result} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <SheetFooter className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex flex-row justify-end">
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

