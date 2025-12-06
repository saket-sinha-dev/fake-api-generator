/**
 * Constants for field types
 * Centralized configuration following DRY principle
 */

export const FIELD_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  EMAIL: 'email',
  UUID: 'uuid',
  IMAGE: 'image',
  RELATION: 'relation',
} as const;

export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES];

/**
 * Faker methods available for string fields
 * Exported in the format expected by the UI
 */
export const FAKER_METHODS = [
  { label: 'First Name', value: 'person.firstName' },
  { label: 'Last Name', value: 'person.lastName' },
  { label: 'Full Name', value: 'person.fullName' },
  { label: 'Email', value: 'internet.email' },
  { label: 'Username', value: 'internet.userName' },
  { label: 'Phone', value: 'phone.number' },
  { label: 'Address', value: 'location.streetAddress' },
  { label: 'City', value: 'location.city' },
  { label: 'Country', value: 'location.country' },
  { label: 'Company', value: 'company.name' },
  { label: 'Job Title', value: 'person.jobTitle' },
  { label: 'Product Name', value: 'commerce.productName' },
  { label: 'Price', value: 'commerce.price' },
  { label: 'Description', value: 'commerce.productDescription' },
  { label: 'Lorem Sentence', value: 'lorem.sentence' },
  { label: 'Lorem Paragraph', value: 'lorem.paragraph' },
  { label: 'Color', value: 'color.human' },
  { label: 'Random Number', value: 'number.int' },
] as const;

/**
 * Valid HTTP status codes
 * Exported in the format expected by the UI
 */
export const VALID_STATUS_CODES = [
  { code: 200, label: '200 - OK' },
  { code: 201, label: '201 - Created' },
  { code: 204, label: '204 - No Content' },
  { code: 400, label: '400 - Bad Request' },
  { code: 401, label: '401 - Unauthorized' },
  { code: 403, label: '403 - Forbidden' },
  { code: 404, label: '404 - Not Found' },
  { code: 409, label: '409 - Conflict' },
  { code: 422, label: '422 - Unprocessable Entity' },
  { code: 500, label: '500 - Internal Server Error' },
  { code: 502, label: '502 - Bad Gateway' },
  { code: 503, label: '503 - Service Unavailable' },
] as const;

export type StatusCode = typeof VALID_STATUS_CODES[number]['code'];
