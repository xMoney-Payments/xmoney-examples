import { type ReactNode, useState } from 'react'
import { Check, Copy, FileCode, Lock, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { TestCards } from '@/components/test-cards'

export interface CodeTab {
    value: string
    label: string
    content: string
    language: string
}

interface ThreeColumnLayoutProps {
    title: string
    icon: ReactNode
    sidebarContent: ReactNode
    children: ReactNode // The preview content
    codeTabs: CodeTab[]
    loading?: boolean
    error?: string | null
    onRefresh?: () => void
    themeMode?: 'light' | 'dark'
}

export function ThreeColumnLayout({
    title,
    icon,
    sidebarContent,
    children,
    codeTabs,
    loading = false,
    error = null,
    onRefresh,
    themeMode = 'light',
}: ThreeColumnLayoutProps) {
    const [activeCodeTab, setActiveCodeTab] = useState(codeTabs[0]?.value || 'client')
    const [copied, setCopied] = useState(false)

    return (
        <TooltipProvider>
            <div className='flex flex-col-reverse md:flex-row bg-gray-50 font-sans text-slate-900 h-auto md:h-[calc(100vh-56px)] overflow-y-auto md:overflow-hidden'>
                {/* Sidebar Settings */}
                <div className='w-full md:w-[340px] bg-white border-t md:border-t-0 md:border-r border-gray-200 flex flex-col h-[500px] md:h-full shrink-0 z-10 shadow-sm'>
                    {sidebarContent}
                </div>

                {/* Main Content Area */}
                <div className='flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden'>
                    {/* Split Pane Container */}
                    <div className='flex-1 flex flex-col lg:flex-row items-stretch overflow-y-auto md:overflow-hidden'>
                        {/* Left: Preview */}
                        <div className='flex-1 bg-slate-50 relative overflow-hidden flex flex-col'>
                            {/* Workspace Toolbar */}
                            <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
                                <div className="flex items-center gap-2">
                                    <div className='h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center'>
                                        {icon}
                                    </div>
                                    <h1 className='text-sm font-semibold text-slate-900'>
                                        {title}
                                    </h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TestCards />
                                    {onRefresh && (
                                        <button
                                            onClick={onRefresh}
                                            className="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-900 transition-colors"
                                            title="Refresh Preview"
                                        >
                                            <RotateCw className={cn("w-4 h-4", loading ? "animate-spin" : "")} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className='flex-1 relative overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]'>
                                <div className="min-h-full flex items-center justify-center p-0 md:p-8">
                                    {/* Browser Window Mockup */}
                                    <div className="w-full md:max-w-[480px] bg-white md:rounded-xl md:shadow-2xl border-none md:border md:border-gray-200/60 overflow-hidden flex flex-col transition-all duration-500 ease-in-out h-full md:h-auto min-h-[500px] md:min-h-0">
                                        {/* Browser Header */}
                                        <div className="hidden md:flex bg-gray-100/80 backdrop-blur-sm border-b border-gray-200 p-3 items-center gap-4 shrink-0">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-500/30"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500/30"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500/30"></div>
                                            </div>
                                            <div className="flex-1 flex justify-center">
                                                <div className="bg-white/80 border border-gray-200/50 rounded-md px-3 py-1 text-[10px] text-gray-400 font-medium flex items-center gap-1.5 w-[200px] justify-center shadow-sm">
                                                    <Lock className="w-2.5 h-2.5" />
                                                    secure.payment.com
                                                </div>
                                            </div>
                                            <div className="w-10"></div> {/* Spacer for alignment */}
                                        </div>
                                        {/* Browser Content (The actual form) */}
                                        <div className={cn("p-0 relative min-h-[400px] flex flex-col bg-white", themeMode === 'dark' ? 'bg-[#1a1a1a]' : '')}>
                                            {/* Loading State */}
                                            {loading && (
                                                <div className='absolute inset-0 z-20 flex flex-col items-start justify-center p-6 bg-white/80 backdrop-blur-sm space-y-4'>
                                                    <div className="space-y-2 w-full">
                                                        <Skeleton className="h-4 w-[120px]" />
                                                        <Skeleton className="h-10 w-full" />
                                                    </div>
                                                    <div className="space-y-2 w-full">
                                                        <Skeleton className="h-4 w-[100px]" />
                                                        <Skeleton className="h-10 w-full" />
                                                    </div>
                                                    <div className="flex w-full gap-4">
                                                        <div className="space-y-2 flex-1">
                                                            <Skeleton className="h-4 w-[80px]" />
                                                            <Skeleton className="h-10 w-full" />
                                                        </div>
                                                        <div className="space-y-2 flex-1">
                                                            <Skeleton className="h-4 w-[40px]" />
                                                            <Skeleton className="h-10 w-full" />
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 w-full">
                                                        <Skeleton className="h-12 w-full rounded-lg" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error State */}
                                            {error && (
                                                <div className='absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center text-red-600 bg-red-50/90 backdrop-blur-sm'>
                                                    <p className='font-bold mb-2'>Configuration Error</p>
                                                    <p className='text-sm'>{error}</p>
                                                </div>
                                            )}

                                            {/* Actual Content (Widget) */}
                                            <div className={cn(
                                                'transition-opacity duration-300 w-full flex-1',
                                                loading || error ? 'opacity-0' : 'opacity-100'
                                            )}>
                                                {children}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Code */}
                        <div className={cn(
                            'flex-1 bg-[#0F172A] border-l border-slate-800 flex-col overflow-hidden w-full lg:max-w-[50%] min-h-[400px] lg:min-h-0',
                            'hidden lg:flex'
                        )}>
                            <Tabs value={activeCodeTab} onValueChange={setActiveCodeTab} className="flex flex-col h-full">
                                {/* Header for Code */}
                                <div className='bg-[#1E293B] border-b border-slate-700/50 px-4 flex items-center justify-between shrink-0 h-12'>
                                    <div className='flex items-center h-full'>
                                        <TabsList className="bg-transparent border-0 p-0 h-full gap-6">
                                            {codeTabs.map((tab) => (
                                                <TabsTrigger
                                                    key={tab.value}
                                                    value={tab.value}
                                                    className="h-full px-0 gap-2 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-blue-400 data-[state=active]:text-blue-400 text-slate-400 hover:text-slate-300 transition-all rounded-none bg-transparent data-[state=active]:bg-transparent shadow-none"
                                                >
                                                    <FileCode className="w-3.5 h-3.5" />
                                                    {tab.label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => {
                                                const content = codeTabs.find(t => t.value === activeCodeTab)?.content || ''
                                                navigator.clipboard.writeText(content)
                                                setCopied(true)
                                                setTimeout(() => setCopied(false), 2000)
                                            }}
                                            className='text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 px-2 py-1 rounded cursor-pointer'
                                        >
                                            {copied ? (
                                                <Check className='w-3.5 h-3.5' />
                                            ) : (
                                                <Copy className='w-3.5 h-3.5' />
                                            )}
                                            <span className='hidden sm:inline'>Copy</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable Syntax */}
                                <div className='flex-1 overflow-auto custom-scrollbar flex flex-col'>
                                    {codeTabs.map((tab) => (
                                        <TabsContent key={tab.value} value={tab.value} className="m-0 flex-1 flex flex-col min-h-0">
                                            <SyntaxHighlighter
                                                language={tab.language}
                                                style={vscDarkPlus}
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '1.5rem',
                                                    fontSize: '13px',
                                                    lineHeight: '1.6',
                                                    background: 'transparent',
                                                    fontFamily:
                                                        'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                                                    height: '100%'
                                                }}
                                                showLineNumbers={true}
                                                lineNumberStyle={{
                                                    minWidth: '2.5em',
                                                    paddingRight: '1em',
                                                    color: '#4b5563',
                                                    textAlign: 'right',
                                                    fontSize: '12px',
                                                    opacity: 0.5
                                                }}
                                                wrapLines={true}
                                            >
                                                {tab.content}
                                            </SyntaxHighlighter>
                                        </TabsContent>
                                    ))}
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}

