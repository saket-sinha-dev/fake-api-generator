import { IFieldGenerator } from '@/interfaces/IFieldGenerator';
import { FIELD_TYPES } from '@/constants/fieldTypes';

/**
 * Email field generator
 * Generates valid email addresses using faker.js
 */
export class EmailFieldGenerator implements IFieldGenerator {
  constructor(private faker: any) {}

  generate(_field: any, _allData?: any): string {
    return this.faker.internet.email();
  }

  getType(): string {
    return FIELD_TYPES.EMAIL;
  }
}
