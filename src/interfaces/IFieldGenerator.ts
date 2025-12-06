/**
 * Interface for field value generators
 * Each field type should have its own implementation
 * Following the Strategy Pattern for extensibility (Open/Closed Principle)
 */
export interface IFieldGenerator {
  /**
   * Generates a value for a field based on its configuration
   * @param field - The field configuration
   * @param allData - Optional context data for relation fields
   * @returns The generated value
   */
  generate(field: any, allData?: any): any;
  
  /**
   * Returns the field type this generator handles
   */
  getType(): string;
}
