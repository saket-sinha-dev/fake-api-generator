import { IFieldGenerator } from '@/interfaces/IFieldGenerator';
import { FIELD_TYPES } from '@/constants/fieldTypes';

/**
 * Boolean field generator
 * Generates random boolean values
 */
export class BooleanFieldGenerator implements IFieldGenerator {
  constructor(private faker: any) {}

  generate(_field: any, _allData?: any): boolean {
    return this.faker.datatype.boolean();
  }

  getType(): string {
    return FIELD_TYPES.BOOLEAN;
  }
}
