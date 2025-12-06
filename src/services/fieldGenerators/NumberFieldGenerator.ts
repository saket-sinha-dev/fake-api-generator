import { IFieldGenerator } from '@/interfaces/IFieldGenerator';
import { FIELD_TYPES } from '@/constants/fieldTypes';

/**
 * Number field generator
 * Generates numeric values using faker.js
 */
export class NumberFieldGenerator implements IFieldGenerator {
  constructor(private faker: any) {}

  generate(_field: any, _allData?: any): number {
    return this.faker.number.int({ min: 1, max: 1000 });
  }

  getType(): string {
    return FIELD_TYPES.NUMBER;
  }
}
