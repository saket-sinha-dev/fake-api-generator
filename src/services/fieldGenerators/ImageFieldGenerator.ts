import { IFieldGenerator } from '@/interfaces/IFieldGenerator';
import { FIELD_TYPES } from '@/constants/fieldTypes';

/**
 * Image field generator
 * Generates image URLs using faker.js
 */
export class ImageFieldGenerator implements IFieldGenerator {
  constructor(private faker: any) {}

  generate(_field: any, _allData?: any): string {
    return this.faker.image.url();
  }

  getType(): string {
    return FIELD_TYPES.IMAGE;
  }
}
