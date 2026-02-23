export type Card = {
  id: number
  customerId: number
  type: CardTypeEnum
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  nameOnCard: string
  cardHolderCountry: string
  cardHolderState: null
  cardProvider: string
  hasToken: boolean
  cardStatus: string
  binInfo: {
    bin: number
    brand: string
    type: string
    level: string
    countryCode: string
    bank: string
  }
}

export const enum CardTypeEnum {
  Visa = 'visa',
  Mastercard = 'mastercard',
  Maestro = 'maestro',
}

export const enum TransactionStatusEnum {
  Start = 'start',
  CompleteOk = 'complete-ok',
  CancelOk = 'cancel-ok',
  RefundOk = 'refund-ok',
  VoidOk = 'void-ok',
  ChargeBack = 'charge-back',
  ChargeBackInProgress = 'charge-back-in-progress',
  CompleteFailed = 'complete-failed',
  InProgress = 'in-progress',
  '3DPending' = '3d-pending',
  Uncertain = 'uncertain',
}

export interface TransactionCustomerData {
  id: number
  siteId: number
  identifier: string
  firstName: string
  lastName: string
  country: string
  state: string
  city: string
  zipCode: string
  address: string
  phone: string
  email: string
  isWhitelisted: boolean
  isWhitelistedUntil: string | null
  creationDate: string
  creationTimestamp: number
}

export interface TransactionDetails {
  id: number
  transactionStatus: TransactionStatusEnum
  amount: number
  currencyKey: string
  amountInEuro: number
  customerData: TransactionCustomerData
  externalOrderId: string
  description: string
}

export interface CardHolderVerificationResult {
  status: MatchStatusEnum
  firstNameStatus?: MatchStatusEnum
  middleNameStatus?: MatchStatusEnum
  lastNameStatus?: MatchStatusEnum
}

export enum MatchStatusEnum {
  Matched = 'MATCHED',
  NotMatched = 'NOT_MATCHED',
  NotVerified = 'NOT_VERIFIED',
  PartialMatched = 'PARTIAL_MATCHED',
  NotSupported = 'NOT_SUPPORTED',
}
