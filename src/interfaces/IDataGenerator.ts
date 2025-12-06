import { IFieldGenerator } from './IFieldGenerator';

/**
 * Interface for the main data generation service
 * Coordinates field generators and produces complete data records
 */
export interface IDataGenerator {
  /**
   * Generate a value for a single field
   */
  generateFieldValue(field: any, allData?: any): any;
  
  /**
   * Generate multiple records for a resource
   */
  generateRecords(resource: any, count: number): any[];
  
  /**
   * Register a new field generator
   * Allows dynamic extension without modifying the data generator (Open/Closed Principle)
   */
  registerGenerator(generator: IFieldGenerator): void;
  
  /**
   * Get all supported field types
   */
  getSupportedTypes(): string[];
}
