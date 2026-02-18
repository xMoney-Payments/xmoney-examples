export const enum TransactionTypeEnum {
  Deposit = 'deposit',
  Refund = 'refund',
  Credit = 'credit',
  Chargeback = 'chargeback',
  Representment = 'representment',
  VerifyCard = 'verify-card',
}

export const enum TransactionMethodEnum {
  Card = 'card',
  Wallet = 'wallet',
  Transfer = 'transfer',
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

export const enum CardTypeEnum {
  Visa = 'visa',
  Mastercard = 'mastercard',
  Maestro = 'maestro',
}

export const enum CardStatusEnum {
  Active = 'active',
  Deleted = 'deleted',
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
  creationDate: string
  creationTimestamp: number
}

export interface TransactionDetailsCard {
  id: number
  customerId: number
  type: CardTypeEnum
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  nameOnCard: string
  cardStatus: CardStatusEnum
  binInfo: {
    bin: number
    brand: string
    type: string
    level: string
    countryCode: string
    bank: string
  }
}

export interface TransactionDetails {
  id: number
  siteId: number
  orderId: number
  customerId: number
  customerData: TransactionCustomerData
  transactionType: TransactionTypeEnum
  transactionMethod: TransactionMethodEnum
  transactionStatus: TransactionStatusEnum
  ip: string | null
  amount: string
  currency: string
  amountInEur: string
  description: string
  creationDate: string
  cardProviderName: string
  cardType: string
  cardNumber: string
  cardExpiryDate: string
  cardHolderName: string | null
  card: TransactionDetailsCard
  reason?: string | null
  parentTransactionId?: number
  relatedTransactionIds?: number[]
}

export enum xMoneyOrderStatusEnum {
  Start = 'start',
  InProgress = 'in-progress',
  Retrying = 'retrying',
  Expiring = 'expiring',
  CompleteOk = 'complete-ok',
  CompleteFailed = 'completed-failed',
}

export enum xMoneyTransactionMethodEnum {
  Card = 'card',
  Wallet = 'wallet',
}

export enum xMoneyOrderTypeEnum {
  Purchase = 'purchase',
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
