export enum MatchStatusEnum {
  Matched = 'MATCHED',
  NotMatched = 'NOT_MATCHED',
  NotVerified = 'NOT_VERIFIED',
  PartialMatched = 'PARTIAL_MATCHED',
  NotSupported = 'NOT_SUPPORTED',
}

export interface CardHolderVerificationResult {
  status: MatchStatusEnum
  firstNameStatus?: MatchStatusEnum
  middleNameStatus?: MatchStatusEnum
  lastNameStatus?: MatchStatusEnum
}

