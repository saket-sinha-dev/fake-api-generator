import { IFieldGenerator } from '@/interfaces/IFieldGenerator';
import { FIELD_TYPES } from '@/constants/fieldTypes';
import { randomUUID } from 'crypto';

/**
 * UUID field generator
 * Generates unique identifiers using Node.js crypto module
 */
export class UuidFieldGenerator implements IFieldGenerator {
  generate(_field: any, _allData?: any): string {
    return randomUUID();
  }

  getType(): string {
    return FIELD_TYPES.UUID;
  }
}
