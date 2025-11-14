export const ERROR_MESSAGES = {
  AUTH: {
    AUTHENTICATION_REQUIRED: 'Authentication required',
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_TOKEN: 'Invalid token',
    TOKEN_EXPIRED: 'Token has expired',
  },

  VALIDATION: {
    INVALID_INPUT: 'Invalid input provided',
    REQUIRED_FIELD_MISSING: 'Required field is missing',
  },

  PAGINATION: {
    INVALID_CURSOR: 'Invalid cursor format',
    INVALID_CURSOR_STRUCTURE: 'Invalid cursor structure',
    INVALID_SORT_COLUMN: 'Invalid sort column',
    TABLE_MISSING_ID: 'Table must have an id column',
  },
} as const;

export type ErrorMessageCategory = keyof typeof ERROR_MESSAGES;
export type ErrorMessage<T extends ErrorMessageCategory> =
  (typeof ERROR_MESSAGES)[T][keyof (typeof ERROR_MESSAGES)[T]];
