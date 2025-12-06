import { IFieldGenerator } from '@/interfaces/IFieldGenerator';
import { FIELD_TYPES } from '@/constants/fieldTypes';

/**
 * Date field generator
 * Generates date values using faker.js
 */
export class DateFieldGenerator implements IFieldGenerator {
  constructor(private faker: any) {}

  generate(_field: any, _allData?: any): string {
    return this.faker.date.recent().toISOString();
  }

  getType(): string {
    return FIELD_TYPES.DATE;
  }
}
