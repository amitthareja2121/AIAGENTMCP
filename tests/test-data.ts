/**
 * Centralized test data for practicesoftwaretesting.com
 * All test specs should import from here instead of hardcoding values.
 * Update this file once → all tests pick up the change automatically.
 */

export const testData = {

  /** Sign-in credentials */
  signIn: {
    email:    'admin@practicesoftwaretesting.com',
    password: 'welcome01',
  },

  /** Expected display name after login */
  expectedUser: 'John Doe',

  /** Billing address (matches admin profile on the site) */
  billing: {
    street:     'Test street 123',
    houseNumber: '123',
    city:       'Utrecht',
    state:      'Utrecht',
    country:    'NL',          // country select value (ISO code)
    postalCode: '3511AA',
  },

  /** Payment details — Bank Transfer */
  payment: {
    method:        'bank-transfer',  // data-test="payment-method" select value
    bankName:      'ING Bank',       // data-test="bank_name"
    accountName:   'John Doe',       // data-test="account_name"  (letters/spaces only)
    accountNumber: '123456789',      // data-test="account_number" (digits only)
  },

  /** Site base URL */
  baseUrl: 'https://practicesoftwaretesting.com',

};
