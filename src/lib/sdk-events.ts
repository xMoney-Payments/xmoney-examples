export type SdkEventName =
  | 'onReady'
  | 'onValidation'
  | 'onPaymentProcessing'
  | 'onPaymentChange'
  | 'onPaymentComplete'
  | 'onError'

export interface SdkLogEvent {
  id: string
  name: SdkEventName
  timestamp: number
  payload?: unknown
}

let eventSeq = 0

export function createSdkLogEvent(
  name: SdkEventName,
  payload?: unknown
): SdkLogEvent {
  eventSeq += 1
  return {
    id: `${Date.now()}-${eventSeq}`,
    name,
    timestamp: Date.now(),
    payload,
  }
}
