import { IFieldGenerator } from '@/interfaces/IFieldGenerator';
import { FIELD_TYPES } from '@/constants/fieldTypes';

/**
 * String field generator
 * Generates string values using faker.js or custom methods
 */
export class StringFieldGenerator implements IFieldGenerator {
  constructor(private faker: any) {}

  generate(field: any, _allData?: any): string {
    // Use custom faker method if specified
    if (field.fakerMethod) {
      return this.getFakerValue(field.fakerMethod);
    }
    
    // Default to lorem word
    return this.faker.lorem.word();
  }

  getType(): string {
    return FIELD_TYPES.STRING;
  }

  private getFakerValue(method: string): string {
    try {
      const parts = method.split('.');
      let result: any = this.faker;
      
      for (const part of parts) {
        result = result[part];
        if (!result) {
          return this.faker.lorem.word();
        }
      }
      
      // Call the function if it is one
      if (typeof result === 'function') {
        return result();
      }
      
      return result;
    } catch (error) {
      // Fallback to default
      return this.faker.lorem.word();
    }
  }
}
