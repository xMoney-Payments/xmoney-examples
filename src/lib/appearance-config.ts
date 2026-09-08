import type {
  AppearanceRuleSelector,
  AppearanceRuleStyles,
  AppearanceRules,
  AppearanceVariables,
} from '@/types/xmoney-sdk/sdk-base.types'

export type AppearanceVariableGroup =
  | 'text'
  | 'borders'
  | 'backgrounds'
  | 'shape'
  | 'saveCard'

export interface AppearanceVariableField {
  id: keyof AppearanceVariables
  label: string
  group: AppearanceVariableGroup
  inputType: 'color' | 'text'
  defaultValue: string
}

export const APPEARANCE_VARIABLE_GROUP_LABELS: Record<
  AppearanceVariableGroup,
  string
> = {
  text: 'Text & accents',
  borders: 'Borders',
  backgrounds: 'Backgrounds',
  shape: 'Shape & typography',
  saveCard: 'Save card',
}

export const APPEARANCE_VARIABLE_FIELDS: AppearanceVariableField[] = [
  {
    id: 'colorPrimary',
    label: 'Primary Color',
    group: 'text',
    inputType: 'color',
    defaultValue: '#009688',
  },
  {
    id: 'colorDanger',
    label: 'Danger Color',
    group: 'text',
    inputType: 'color',
    defaultValue: '#e53935',
  },
  {
    id: 'colorText',
    label: 'Primary Text',
    group: 'text',
    inputType: 'color',
    defaultValue: '#212121',
  },
  {
    id: 'colorTextSecondary',
    label: 'Secondary Text',
    group: 'text',
    inputType: 'color',
    defaultValue: '#757575',
  },
  {
    id: 'colorTextPlaceholder',
    label: 'Placeholder Text',
    group: 'text',
    inputType: 'color',
    defaultValue: '#bdbdbd',
  },
  {
    id: 'colorTextDisabled',
    label: 'Disabled Text',
    group: 'text',
    inputType: 'color',
    defaultValue: '#9e9e9e',
  },
  {
    id: 'colorBorder',
    label: 'Border Color',
    group: 'borders',
    inputType: 'color',
    defaultValue: '#e0e0e0',
  },
  {
    id: 'colorBorderHover',
    label: 'Border Hover',
    group: 'borders',
    inputType: 'color',
    defaultValue: '#bdbdbd',
  },
  {
    id: 'colorBorderFocus',
    label: 'Border Focus',
    group: 'borders',
    inputType: 'color',
    defaultValue: '#009688',
  },
  {
    id: 'colorBackground',
    label: 'Background',
    group: 'backgrounds',
    inputType: 'color',
    defaultValue: '#f5f5f5',
  },
  {
    id: 'colorBackgroundInput',
    label: 'Input Background',
    group: 'backgrounds',
    inputType: 'color',
    defaultValue: '#ffffff',
  },
  {
    id: 'colorBackgroundHover',
    label: 'Hover Background',
    group: 'backgrounds',
    inputType: 'color',
    defaultValue: '#fafafa',
  },
  {
    id: 'colorBackgroundFocus',
    label: 'Focus Background',
    group: 'backgrounds',
    inputType: 'color',
    defaultValue: '#ffffff',
  },
  {
    id: 'colorBackgroundDisabled',
    label: 'Disabled Background',
    group: 'backgrounds',
    inputType: 'color',
    defaultValue: '#f5f5f5',
  },
  {
    id: 'borderRadius',
    label: 'Border Radius',
    group: 'shape',
    inputType: 'text',
    defaultValue: '18px',
  },
  {
    defaultValue: '18px',
  },
  {
    id: 'fontFamily',
    label: 'Font Family',
    group: 'shape',
    inputType: 'text',
    defaultValue: 'system-ui, sans-serif',
  },
  {
    id: 'saveCardSize',
    label: 'Checkbox Size',
    group: 'saveCard',
    inputType: 'text',
    defaultValue: '18px',
  },
  {
    id: 'saveCardCheckSize',
    label: 'Checkmark Size',
    group: 'saveCard',
    inputType: 'text',
    defaultValue: '12px',
  },
  {
    id: 'saveCardCheckColor',
    label: 'Checkmark Color',
    group: 'saveCard',
    inputType: 'color',
    defaultValue: '#ffffff',
  },
  {
    id: 'saveCardBorderWidth',
    label: 'Border Width',
    group: 'saveCard',
    inputType: 'text',
    defaultValue: '2px',
  },
  {
    id: 'saveCardBorderColor',
    label: 'Border Color',
    group: 'saveCard',
    inputType: 'color',
    defaultValue: '#bdbdbd',
  },
  {
    id: 'saveCardBorderRadius',
    label: 'Border Radius',
    group: 'saveCard',
    inputType: 'text',
    defaultValue: '4px',
  },
  {
    id: 'saveCardCheckedBackground',
    label: 'Checked Background',
    group: 'saveCard',
    inputType: 'color',
    defaultValue: '#009688',
  },
  {
    id: 'saveCardGap',
    label: 'Label Gap',
    group: 'saveCard',
    inputType: 'text',
    defaultValue: '8px',
  },
]

export type AppearanceVariableOverride = {
  enabled: boolean
  value: string
}

export type AppearanceVariableOverrides = Record<
  keyof AppearanceVariables,
  AppearanceVariableOverride
>

export function createDefaultAppearanceVariables(): AppearanceVariableOverrides {
  return APPEARANCE_VARIABLE_FIELDS.reduce((acc, field) => {
    acc[field.id] = { enabled: false, value: field.defaultValue }
    return acc
  }, {} as AppearanceVariableOverrides)
}

export const DEFAULT_APPEARANCE_VARIABLES = createDefaultAppearanceVariables()

export interface AppearanceRuleSelectorOption {
  value: AppearanceRuleSelector
  label: string
}

export const APPEARANCE_RULE_SELECTORS: AppearanceRuleSelectorOption[] = [
  { value: '.xmoney-label', label: 'Label' },
  { value: '.xmoney-label--empty', label: 'Label (empty)' },
  { value: '.xmoney-label--invalid', label: 'Label (invalid)' },
  { value: '.xmoney-label--focused', label: 'Label (focused)' },
  { value: '.xmoney-input', label: 'Input' },
  { value: '.xmoney-input--empty', label: 'Input (empty)' },
  { value: '.xmoney-input--invalid', label: 'Input (invalid)' },
  { value: '.xmoney-input:hover', label: 'Input (hover)' },
  { value: '.xmoney-input:focus', label: 'Input (focus)' },
  { value: '.xmoney-input:disabled', label: 'Input (disabled)' },
  { value: '.xmoney-input:autofill', label: 'Input (autofill)' },
  { value: '.xmoney-input::placeholder', label: 'Input (placeholder)' },
  { value: '.xmoney-input::selection', label: 'Input (selection)' },
  { value: '.xmoney-error', label: 'Error' },
  { value: '.xmoney-card-group', label: 'Card group' },
  { value: '.xmoney-card-group--invalid', label: 'Card group (invalid)' },
  { value: '.xmoney-card-group--invalid:hover', label: 'Card group (invalid, hover)' },
  { value: '.save-card-container', label: 'Save card container' },
  { value: '.save-card', label: 'Save card checkbox' },
  { value: '.save-card:hover', label: 'Save card (hover)' },
  { value: '.save-card:focus-visible', label: 'Save card (focus-visible)' },
  { value: '.save-card:checked', label: 'Save card (checked)' },
  { value: '.save-card::before', label: 'Save card (::before)' },
  { value: '.save-card-label', label: 'Save card label' },
]

export interface AppearanceRuleEntry {
  id: string
  selector: AppearanceRuleSelector
  cssText: string
  parseError?: string
}

export const DEFAULT_APPEARANCE_RULES: AppearanceRuleEntry[] = [
  {
    id: 'sample-label',
    selector: '.xmoney-label',
    cssText: 'fontWeight: 600\nletterSpacing: 0.02em',
  },
  {
    id: 'sample-input',
    selector: '.xmoney-input',
    cssText: 'borderWidth: 1px',
  },
  {
    id: 'sample-input-invalid',
    selector: '.xmoney-input--invalid',
    cssText: 'borderColor: #e53935',
  },
]

let ruleEntryCounter = 0

export function createAppearanceRuleEntry(
  selector: AppearanceRuleSelector = '.xmoney-label',
  cssText = ''
): AppearanceRuleEntry {
  ruleEntryCounter += 1
  return {
    id: `rule-${ruleEntryCounter}`,
    selector,
    cssText,
  }
}

export function buildAppearanceVariables(
  overrides: AppearanceVariableOverrides
): AppearanceVariables {
  const variables: AppearanceVariables = {}

  for (const field of APPEARANCE_VARIABLE_FIELDS) {
    const override = overrides[field.id]
    if (override?.enabled && override.value.trim()) {
      variables[field.id] = override.value
    }
  }

  return variables
}

const CSS_PROPERTY_PATTERN = /^[a-zA-Z-]+$/

export function parseInlineRuleCss(text: string): {
  styles: AppearanceRuleStyles
  error?: string
} {
  const styles: AppearanceRuleStyles = {}
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    const normalized = line.endsWith(';') ? line.slice(0, -1).trim() : line
    const colonIndex = normalized.indexOf(':')

    if (colonIndex === -1) {
      return { styles: {}, error: `Invalid line: "${line}"` }
    }

    const property = normalized.slice(0, colonIndex).trim()
    const value = normalized.slice(colonIndex + 1).trim()

    if (!property || !value) {
      return { styles: {}, error: `Invalid line: "${line}"` }
    }

    if (!CSS_PROPERTY_PATTERN.test(property)) {
      return { styles: {}, error: `Invalid property: "${property}"` }
    }

    ;(styles as Record<string, string>)[property] = value
  }

  return { styles }
}

export function serializeRuleStyles(styles: AppearanceRuleStyles): string {
  return Object.entries(styles)
    .map(([property, value]) => `${property}: ${value}`)
    .join('\n')
}

export function buildAppearanceRules(
  entries: AppearanceRuleEntry[]
): AppearanceRules | undefined {
  const rules: AppearanceRules = {}
  let hasRules = false

  for (const entry of entries) {
    if (!entry.selector || !entry.cssText.trim()) continue

    const { styles, error } = parseInlineRuleCss(entry.cssText)
    if (error || Object.keys(styles).length === 0) continue

    rules[entry.selector] = styles
    hasRules = true
  }

  return hasRules ? rules : undefined
}

export function enableAllAppearanceVariables(
  overrides: AppearanceVariableOverrides
): AppearanceVariableOverrides {
  const next = { ...overrides }

  for (const field of APPEARANCE_VARIABLE_FIELDS) {
    next[field.id] = {
      ...next[field.id],
      enabled: true,
    }
  }

  return next
}

export function disableAllAppearanceVariables(
  overrides: AppearanceVariableOverrides
): AppearanceVariableOverrides {
  const next = { ...overrides }

  for (const field of APPEARANCE_VARIABLE_FIELDS) {
    next[field.id] = {
      ...next[field.id],
      enabled: false,
    }
  }

  return next
}
