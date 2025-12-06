import { IDataGenerator } from '@/interfaces/IDataGenerator';
import { IFieldGenerator } from '@/interfaces/IFieldGenerator';
import { FieldGeneratorFactory } from './fieldGenerators/FieldGeneratorFactory';
import { faker } from '@faker-js/faker';

/**
 * Main data generation service
 * Coordinates field generators to produce complete data records
 * Following Single Responsibility Principle - only handles orchestration
 */
export class DataGeneratorService implements IDataGenerator {
  private factory: FieldGeneratorFactory;

  constructor(fakerInstance = faker) {
    this.factory = new FieldGeneratorFactory(fakerInstance);
  }

  /**
   * Generate a value for a single field
   * @param field - The field configuration
   * @param allData - Optional context data for relations
   * @returns The generated value
   */
  generateFieldValue(field: any, allData?: any): any {
    const generator = this.factory.get(field.type);
    
    if (!generator) {
      throw new Error(`No generator found for field type: ${field.type}`);
    }

    return generator.generate(field, allData);
  }

  /**
   * Generate multiple records for a resource
   * @param resource - The resource schema
   * @param count - Number of records to generate
   * @returns Array of generated records
   */
  generateRecords(resource: any, count: number): any[] {
    const records: any[] = [];
    
    for (let i = 0; i < count; i++) {
      const record: any = {};
      
      // Generate value for each field
      for (const field of resource.fields) {
        record[field.name] = this.generateFieldValue(field);
      }
      
      records.push(record);
    }
    
    return records;
  }

  /**
   * Register a new field generator
   * @param generator - The generator to register
   */
  registerGenerator(generator: IFieldGenerator): void {
    this.factory.register(generator);
  }

  /**
   * Get all supported field types
   * @returns Array of supported types
   */
  getSupportedTypes(): string[] {
    return this.factory.getSupportedTypes();
  }
}
