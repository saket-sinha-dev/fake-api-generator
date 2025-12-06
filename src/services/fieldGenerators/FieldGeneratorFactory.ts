import { IFieldGenerator } from '@/interfaces/IFieldGenerator';
import { StringFieldGenerator } from './StringFieldGenerator';
import { NumberFieldGenerator } from './NumberFieldGenerator';
import { BooleanFieldGenerator } from './BooleanFieldGenerator';
import { DateFieldGenerator } from './DateFieldGenerator';
import { EmailFieldGenerator } from './EmailFieldGenerator';
import { UuidFieldGenerator } from './UuidFieldGenerator';
import { ImageFieldGenerator } from './ImageFieldGenerator';
import { RelationFieldGenerator } from './RelationFieldGenerator';

/**
 * Factory for creating and managing field generators
 * Implements the Factory Pattern for generator instantiation
 * Following Open/Closed Principle - can add new generators without modifying this class
 */
export class FieldGeneratorFactory {
  private generators: Map<string, IFieldGenerator> = new Map();

  constructor(private faker: any) {
    this.registerDefaultGenerators();
  }

  /**
   * Register all default field generators
   */
  private registerDefaultGenerators(): void {
    this.register(new StringFieldGenerator(this.faker));
    this.register(new NumberFieldGenerator(this.faker));
    this.register(new BooleanFieldGenerator(this.faker));
    this.register(new DateFieldGenerator(this.faker));
    this.register(new EmailFieldGenerator(this.faker));
    this.register(new UuidFieldGenerator());
    this.register(new ImageFieldGenerator(this.faker));
    this.register(new RelationFieldGenerator(this.faker));
  }

  /**
   * Register a new field generator
   * @param generator - The generator to register
   */
  register(generator: IFieldGenerator): void {
    this.generators.set(generator.getType(), generator);
  }

  /**
   * Get a generator for a specific field type
   * @param type - The field type
   * @returns The generator or undefined if not found
   */
  get(type: string): IFieldGenerator | undefined {
    return this.generators.get(type);
  }

  /**
   * Check if a generator exists for a field type
   * @param type - The field type
   * @returns True if generator exists
   */
  has(type: string): boolean {
    return this.generators.has(type);
  }

  /**
   * Get all supported field types
   * @returns Array of supported field types
   */
  getSupportedTypes(): string[] {
    return Array.from(this.generators.keys());
  }
}
