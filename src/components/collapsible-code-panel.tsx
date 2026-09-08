import { useState } from 'react'
import { Check, Code2, Copy, FileCode, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface CodeTab {
  value: string
  label: string
  content: string
  language: string
}

export function CollapsibleCodePanel({ codeTabs }: { codeTabs: CodeTab[] }) {
  const [codePanelOpen, setCodePanelOpen] = useState(false)
  const [activeCodeTab, setActiveCodeTab] = useState(
    codeTabs[0]?.value || 'client'
  )
  const [copied, setCopied] = useState(false)

  if (codeTabs.length === 0) return null

  return (
    <>
      <button
        type='button'
        onClick={() => setCodePanelOpen((open) => !open)}
        className='absolute bottom-6 right-6 z-30 hidden items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg ring-1 ring-slate-700 transition-colors hover:bg-slate-800 lg:flex'
      >
        <Code2 className='h-4 w-4 text-blue-400' />
        {codePanelOpen ? 'Hide code' : 'View code'}
      </button>

      {codePanelOpen && (
        <div
          className='absolute inset-0 z-20 hidden bg-black/20 backdrop-blur-[1px] lg:block'
          onClick={() => setCodePanelOpen(false)}
        />
      )}

      <div
        className={cn(
          'absolute right-0 top-0 z-20 hidden h-full w-[720px] max-w-full flex-col border-l border-slate-800 bg-[#0F172A] shadow-2xl transition-transform duration-300 ease-in-out lg:flex',
          codePanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <Tabs
          value={activeCodeTab}
          onValueChange={setActiveCodeTab}
          className='flex h-full flex-col'
        >
          <div className='flex h-12 shrink-0 items-center justify-between border-b border-slate-700/50 bg-[#1E293B] px-4'>
            <div className='flex h-full items-center'>
              <TabsList className='h-full gap-5 border-0 bg-transparent p-0'>
                {codeTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className='h-full gap-1.5 rounded-none border-b-2 border-transparent bg-transparent px-0 text-xs font-medium text-slate-400 shadow-none transition-all hover:text-slate-300 data-[state=active]:border-blue-400 data-[state=active]:bg-transparent data-[state=active]:text-blue-400'
                  >
                    <FileCode className='h-3.5 w-3.5' />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => {
                  const content =
                    codeTabs.find((t) => t.value === activeCodeTab)?.content ||
                    ''
                  navigator.clipboard.writeText(content)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className='flex cursor-pointer items-center gap-1.5 rounded bg-white/5 px-2 py-1 font-mono text-xs text-slate-400 transition-colors hover:bg-white/10 hover:text-white'
              >
                {copied ? (
                  <Check className='h-3.5 w-3.5' />
                ) : (
                  <Copy className='h-3.5 w-3.5' />
                )}
                <span>Copy</span>
              </button>
              <button
                type='button'
                onClick={() => setCodePanelOpen(false)}
                className='rounded p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          </div>

          <div className='flex flex-1 flex-col overflow-auto'>
            {codeTabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className='m-0 flex min-h-0 flex-1 flex-col'
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
                  showLineNumbers
                  lineNumberStyle={{
                    minWidth: '2.5em',
                    paddingRight: '1em',
                    color: '#4b5563',
                    textAlign: 'right',
                    fontSize: '12px',
                    opacity: 0.5,
                  }}
                  wrapLines
                >
                  {tab.content}
                </SyntaxHighlighter>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </>
  )
}
