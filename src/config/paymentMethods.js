// Uniform Payment Methods Configuration
export const PAYMENT_METHODS = [
  {
    value: 'paypal',
    label: 'PayPal',
    icon: 'bi-paypal',
    color: 'primary',
    details: 'pamojakeny@gmail.com',
    instructions: 'Send payment to PayPal account and enter transaction ID'
  },
  {
    value: 'venmo',
    label: 'Venmo',
    icon: 'bi-phone',
    color: 'info',
    details: '@pamoja-kenya',
    instructions: 'Send payment to Venmo account and enter transaction ID'
  },
  {
    value: 'zelle',
    label: 'Zelle',
    icon: 'bi-lightning',
    color: 'warning',
    details: 'pamojakeny@gmail.com',
    instructions: 'Send payment via Zelle and enter confirmation number'
  },
  {
    value: 'debit_card',
    label: 'Debit Card',
    icon: 'bi-credit-card',
    color: 'secondary',
    details: 'Contact admin for secure payment link',
    instructions: 'Admin will provide secure payment link for card processing'
  },
  {
    value: 'credit_card',
    label: 'Credit Card',
    icon: 'bi-credit-card-2-front',
    color: 'secondary',
    details: 'Contact admin for secure payment link',
    instructions: 'Admin will provide secure payment link for card processing'
  },
  {
    value: 'mpesa',
    label: 'M-Pesa',
    icon: 'bi-phone',
    color: 'success',
    details: '+254700000000',
    instructions: 'Send payment to M-Pesa number and enter transaction code'
  },
  {
    value: 'bank',
    label: 'Bank Transfer',
    icon: 'bi-bank',
    color: 'info',
    details: 'Account: 1234567890, ABC Bank',
    instructions: 'Transfer to bank account and enter reference number'
  },
  {
    value: 'other',
    label: 'Other',
    icon: 'bi-cash',
    color: 'dark',
    details: 'Contact admin for alternative payment methods',
    instructions: 'Please contact admin to arrange alternative payment'
  }
];

export const getPaymentMethod = (value) => {
  return PAYMENT_METHODS.find(method => method.value === value);
};

export const getPaymentOptions = () => {
  return PAYMENT_METHODS.map(method => ({
    value: method.value,
    label: method.label
  }));
};

export const getPaymentInstructions = (paymentMethod, amount) => {
  const method = getPaymentMethod(paymentMethod);
  if (!method) return null;

  return {
    ...method,
    amount: amount,
    formattedAmount: `$${parseFloat(amount).toFixed(2)}`
  };
};