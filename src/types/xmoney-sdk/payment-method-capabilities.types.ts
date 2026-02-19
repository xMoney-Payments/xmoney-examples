export interface PaymentMethodCapabilities {
  googlePay: {
    supported: boolean;
    reason?: string;
  };
  applePay: {
    supported: boolean;
    reason?: string;
  };
}
