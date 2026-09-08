import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  APPEARANCE_RULE_SELECTORS,
  DEFAULT_APPEARANCE_RULES,
  createAppearanceRuleEntry,
  parseInlineRuleCss,
  type AppearanceRuleEntry,
} from '@/lib/appearance-config'
import type { AppearanceRuleSelector } from '@/types/xmoney-sdk/sdk-base.types'
import { Braces, Plus, Trash2 } from 'lucide-react'

function getRuleSelectorOption(selector: AppearanceRuleSelector) {
  return APPEARANCE_RULE_SELECTORS.find((option) => option.value === selector)
}

interface AppearanceRulesEditorProps {
  rules: AppearanceRuleEntry[]
  onChange: (rules: AppearanceRuleEntry[]) => void
}

export function AppearanceRulesEditor({
  rules,
  onChange,
}: AppearanceRulesEditorProps) {
  const validRuleCount = rules.filter(
    (rule) => rule.selector && rule.cssText.trim() && !rule.parseError
  ).length

  const updateRule = (id: string, patch: Partial<AppearanceRuleEntry>) => {
    onChange(
      rules.map((rule) => {
        if (rule.id !== id) return rule

        const next = { ...rule, ...patch }

        if (patch.cssText !== undefined) {
          const { error } = parseInlineRuleCss(patch.cssText)
          next.parseError = error
        }

        return next
      })
    )
  }

  const removeRule = (id: string) => {
    onChange(rules.filter((rule) => rule.id !== id))
  }

  const loadSampleRules = () => {
    onChange(DEFAULT_APPEARANCE_RULES.map((rule) => ({ ...rule })))
  }

  return (
    <div className='space-y-4 min-w-0'>
      <div className='space-y-3'>
        <div>
          <h4 className='text-sm font-bold text-slate-900'>CSS rules</h4>
          <p className='mt-1 text-xs leading-relaxed text-slate-500'>
            Target SDK selectors with camelCase CSS properties, one per line.
          </p>
          {rules.length > 0 && (
            <p className='mt-1 text-xs text-slate-400'>
              {validRuleCount} of {rules.length} rule
              {rules.length === 1 ? '' : 's'} ready to apply
            </p>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-8 text-xs'
            onClick={loadSampleRules}
          >
            Load sample
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 text-xs'
            onClick={() =>
              onChange([...rules, createAppearanceRuleEntry()])
            }
          >
            <Plus className='mr-1 h-3.5 w-3.5' />
            Add rule
          </Button>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className='rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center'>
          <div className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200'>
            <Braces className='h-5 w-5 text-slate-400' />
          </div>
          <p className='text-sm font-medium text-slate-700'>No rules yet</p>
          <p className='mt-1 text-xs text-slate-500'>
            Add a rule or load the sample set to get started.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {rules.map((rule, index) => {
            const selectorOption = getRuleSelectorOption(rule.selector)

            return (
              <div
                key={rule.id}
                className='min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white'
              >
                <div className='flex items-start justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2'>
                  <div className='min-w-0'>
                    <p className='text-xs font-medium text-slate-700'>
                      Rule {index + 1}
                      {selectorOption ? ` · ${selectorOption.label}` : ''}
                    </p>
                    <p className='mt-0.5 break-all font-mono text-[11px] leading-snug text-slate-400'>
                      {rule.selector}
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 shrink-0 text-slate-400 hover:text-red-600'
                    onClick={() => removeRule(rule.id)}
                    aria-label={`Remove rule ${index + 1}`}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>

                <div className='space-y-3 p-3'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs text-slate-600'>Selector</Label>
                    <Select
                      value={rule.selector}
                      onValueChange={(value) =>
                        updateRule(rule.id, {
                          selector: value as AppearanceRuleSelector,
                        })
                      }
                    >
                      <SelectTrigger className='h-auto min-h-9 w-full min-w-0 py-2 text-left'>
                        <SelectValue placeholder='Select a selector'>
                          {selectorOption ? (
                            <span className='flex min-w-0 flex-col gap-0.5 text-left'>
                              <span className='text-xs font-medium text-slate-700'>
                                {selectorOption.label}
                              </span>
                              <span className='break-all font-mono text-[11px] leading-snug text-slate-400'>
                                {rule.selector}
                              </span>
                            </span>
                          ) : (
                            <span className='text-xs text-slate-500'>
                              Select a selector
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className='max-w-[min(24rem,calc(100vw-2rem))]'>
                        {APPEARANCE_RULE_SELECTORS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className='py-2 text-xs'
                          >
                            <span className='flex min-w-0 flex-col gap-0.5'>
                              <span className='font-medium text-slate-700'>
                                {option.label}
                              </span>
                              <span className='break-all font-mono text-[11px] leading-snug text-slate-400'>
                                {option.value}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs text-slate-600'>Inline CSS</Label>
                    <textarea
                      value={rule.cssText}
                      onChange={(e) =>
                        updateRule(rule.id, { cssText: e.target.value })
                      }
                      placeholder={'fontWeight: 600\nletterSpacing: 0.02em'}
                      spellCheck={false}
                      className='border-input focus-visible:ring-ring/50 focus-visible:ring-[3px] min-h-20 w-full resize-y rounded-md border bg-slate-50 px-3 py-2 font-mono text-xs leading-relaxed outline-none'
                    />
                    {rule.parseError ? (
                      <p className='text-xs text-red-600'>{rule.parseError}</p>
                    ) : (
                      rule.cssText.trim() && (
                        <p className='text-[11px] text-slate-400'>
                          Use camelCase properties, one per line.
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
