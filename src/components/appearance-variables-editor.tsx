import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  APPEARANCE_VARIABLE_FIELDS,
  APPEARANCE_VARIABLE_GROUP_LABELS,
  type AppearanceVariableGroup,
  type AppearanceVariableOverrides,
} from '@/lib/appearance-config'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

interface AppearanceVariablesEditorProps {
  overrides: AppearanceVariableOverrides
  onChange: (overrides: AppearanceVariableOverrides) => void
  onCustomMode?: () => void
}

const GROUP_ORDER: AppearanceVariableGroup[] = [
  'text',
  'borders',
  'backgrounds',
  'shape',
  'saveCard',
]

export function AppearanceVariablesEditor({
  overrides,
  onChange,
  onCustomMode,
}: AppearanceVariablesEditorProps) {
  const [search, setSearch] = useState('')

  const enabledCount = useMemo(
    () =>
      APPEARANCE_VARIABLE_FIELDS.filter((field) => overrides[field.id].enabled)
        .length,
    [overrides]
  )

  const normalizedSearch = search.trim().toLowerCase()

  const visibleGroups = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      fields: APPEARANCE_VARIABLE_FIELDS.filter((field) => {
        if (field.group !== group) return false
        if (!normalizedSearch) return true

        return (
          field.label.toLowerCase().includes(normalizedSearch) ||
          field.id.toLowerCase().includes(normalizedSearch)
        )
      }),
    })).filter(({ fields }) => fields.length > 0)
  }, [normalizedSearch])

  const updateOverride = (
    id: keyof AppearanceVariableOverrides,
    patch: Partial<AppearanceVariableOverrides[keyof AppearanceVariableOverrides]>
  ) => {
    onCustomMode?.()
    onChange({
      ...overrides,
      [id]: {
        ...overrides[id],
        ...patch,
      },
    })
  }

  const setAllEnabled = (enabled: boolean) => {
    onCustomMode?.()
    onChange(
      APPEARANCE_VARIABLE_FIELDS.reduce(
        (acc, field) => {
          acc[field.id] = { ...overrides[field.id], enabled }
          return acc
        },
        { ...overrides }
      )
    )
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <div className='space-y-2'>
          <div>
            <h4 className='text-sm font-bold text-slate-900'>Theme variables</h4>
            <p className='text-xs text-slate-500'>
              {enabledCount} of {APPEARANCE_VARIABLE_FIELDS.length} active
            </p>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-7 px-2 text-xs'
              onClick={() => setAllEnabled(true)}
            >
              Enable all
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-7 px-2 text-xs'
              onClick={() => setAllEnabled(false)}
            >
              Disable all
            </Button>
          </div>
        </div>

        <div className='relative'>
          <Search className='pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search variables…'
            className='h-8 pl-8 text-xs'
          />
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <div className='rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500'>
          No variables match your search.
        </div>
      ) : (
        <div className='space-y-4'>
          {visibleGroups.map(({ group, fields }) => (
            <section
              key={group}
              className='overflow-hidden rounded-lg border border-slate-200 bg-white'
            >
              <div className='border-b border-slate-100 bg-slate-50 px-3 py-2'>
                <h4 className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                  {APPEARANCE_VARIABLE_GROUP_LABELS[group]}
                </h4>
              </div>

              <div className='divide-y divide-slate-100'>
                {fields.map((field) => {
                  const override = overrides[field.id]

                  return (
                    <div
                      key={field.id}
                      className={cn(
                        'space-y-2 px-3 py-3 transition-opacity',
                        !override.enabled && 'opacity-50'
                      )}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0 flex-1'>
                          <Label className='text-sm font-normal leading-snug text-slate-700'>
                            {field.label}
                          </Label>
                          <p className='mt-0.5 break-all font-mono text-[11px] leading-snug text-slate-400'>
                            {field.id}
                          </p>
                        </div>
                        <Switch
                          checked={override.enabled}
                          onCheckedChange={(enabled) =>
                            updateOverride(field.id, { enabled })
                          }
                          aria-label={`Enable ${field.label}`}
                          className='mt-0.5 shrink-0'
                        />
                      </div>

                      <div className='flex items-center gap-2'>
                        {field.inputType === 'color' && (
                          <div
                            className={cn(
                              'relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-slate-200 shadow-sm',
                              !override.enabled && 'pointer-events-none'
                            )}
                          >
                            <input
                              type='color'
                              value={override.value.slice(0, 7)}
                              disabled={!override.enabled}
                              onChange={(e) =>
                                updateOverride(field.id, {
                                  value: e.target.value,
                                  enabled: true,
                                })
                              }
                              className='absolute -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer border-0 p-0'
                            />
                          </div>
                        )}
                        <Input
                          className='h-8 min-w-0 flex-1 px-2.5 font-mono text-xs'
                          value={override.value}
                          disabled={!override.enabled}
                          onChange={(e) =>
                            updateOverride(field.id, {
                              value: e.target.value,
                              enabled: true,
                            })
                          }
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
