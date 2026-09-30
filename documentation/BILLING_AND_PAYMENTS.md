# Billing and Payments

The payment abstraction supports a provider-agnostic flow. In this implementation, payment verification is simulated through the backend reference flow and can later be changed to Paystack or Flutterwave.

## Flow

1. Initialize payment
2. Store payment record
3. Verify reference
4. Update subscription
5. Save completed transaction
