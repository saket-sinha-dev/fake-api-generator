import { faker } from '@faker-js/faker';
import { ResourceField } from '@/types';

export function generateFieldValue(field: ResourceField, allData?: any): any {
    switch (field.type) {
        case 'string':
            if (field.fakerMethod) {
                return getFakerValue(field.fakerMethod);
            }
            return faker.lorem.word();

        case 'number':
            return faker.number.int({ min: 1, max: 1000 });

        case 'boolean':
            return faker.datatype.boolean();

        case 'date':
            return faker.date.recent().toISOString();

        case 'email':
            return faker.internet.email();

        case 'uuid':
            return crypto.randomUUID();

        case 'image':
            return faker.image.url();

        case 'relation':
            // For relations, we'd need to pick a random ID from the related resource
            if (allData && field.relationTo && allData[field.relationTo]) {
                const relatedItems = allData[field.relationTo];
                if (relatedItems.length > 0) {
                    return relatedItems[Math.floor(Math.random() * relatedItems.length)].id;
                }
            }
            return null;

        default:
            return null;
    }
}

function getFakerValue(method: string): any {
    try {
        const parts = method.split('.');
        let current: any = faker;

        for (const part of parts) {
            current = current[part];
        }

        if (typeof current === 'function') {
            return current();
        }

        return current;
    } catch (e) {
        return faker.lorem.word();
    }
}

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
];

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
];
