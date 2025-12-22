import { type ReactNode, useState } from 'react'
import { Check, Copy, FileCode, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TestCards } from '@/components/test-cards'

export interface CodeTab {
  value: string
  label: string
  content: string
  language: string
}

interface TwoColumnLayoutProps {
  title: string
  icon: ReactNode
  children: ReactNode // The content
  codeTabs: CodeTab[]
  onRefresh?: () => void
  loading?: boolean
}

export function TwoColumnLayout({
  title,
  icon,
  children,
  codeTabs,
  onRefresh,
  loading = false,
}: TwoColumnLayoutProps) {
  const [activeCodeTab, setActiveCodeTab] = useState(
    codeTabs[0]?.value || 'client'
  )
  const [copied, setCopied] = useState(false)

  return (
    <div className='flex flex-col lg:flex-row bg-gray-50 font-sans text-slate-900 h-auto lg:h-[calc(100vh)] overflow-y-auto lg:overflow-hidden'>
      {/* Left: Content */}
      <div className='flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden'>
        {/* Workspace Toolbar */}
        <div className='h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10'>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center'>
              {icon}
            </div>
            <h1 className='text-sm font-semibold text-slate-900'>{title}</h1>
          </div>
          <div className='flex items-center gap-2'>
            <TestCards />
            {onRefresh && (
              <button
                onClick={onRefresh}
                className='p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-900 transition-colors'
                title='Refresh'
              >
                <RotateCw
                  className={cn('w-4 h-4', loading ? 'animate-spin' : '')}
                />
              </button>
            )}
          </div>
        </div>

        {/* Content Container with Scroll */}
        <div className='flex-1 flex flex-col overflow-y-auto'>
          {/* Content Area */}
          <div>{children}</div>
        </div>
      </div>

      {/* Right: Code Syntax Highlighter */}
      <div
        className={cn(
          'flex-1 bg-[#0F172A] border-l border-slate-800 flex-col overflow-hidden w-full lg:max-w-[40%] min-h-[400px] lg:min-h-0',
          'hidden lg:flex'
        )}
      >
        <Tabs
          value={activeCodeTab}
          onValueChange={setActiveCodeTab}
          className='flex flex-col h-full'
        >
          {/* Header for Code */}
          <div className='bg-[#1E293B] border-b border-slate-700/50 px-4 flex items-center justify-between shrink-0 h-12'>
            <div className='flex items-center h-full'>
              <TabsList className='bg-transparent border-0 p-0 h-full gap-6'>
                {codeTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className='h-full px-0 gap-2 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-blue-400 data-[state=active]:text-blue-400 text-slate-400 hover:text-slate-300 transition-all rounded-none bg-transparent data-[state=active]:bg-transparent shadow-none'
                  >
                    <FileCode className='w-3.5 h-3.5' />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className='flex items-center gap-4'>
              <button
                onClick={() => {
                  const content =
                    codeTabs.find((t) => t.value === activeCodeTab)?.content ||
                    ''
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
              <TabsContent
                key={tab.value}
                value={tab.value}
                className='m-0 flex-1 flex flex-col min-h-0'
              >
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
                    height: '100%',
                  }}
                  showLineNumbers={true}
                  lineNumberStyle={{
                    minWidth: '2.5em',
                    paddingRight: '1em',
                    color: '#4b5563',
                    textAlign: 'right',
                    fontSize: '12px',
                    opacity: 0.5,
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
  )
}
