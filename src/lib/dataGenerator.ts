/**
 * Data Generator
 * 
 * This file now serves as a facade/adapter to the new SOLID-compliant architecture.
 * The actual generation logic has been refactored into:
 * - Individual field generator classes (Strategy Pattern) in src/services/fieldGenerators/
 * - A factory for managing generators (Factory Pattern)
 * - A service for orchestrating data generation (Service Pattern)
 * 
 * This maintains backward compatibility while following SOLID principles:
 * - Single Responsibility: Each generator handles one field type
 * - Open/Closed: New field types can be added without modifying existing code
 * - Liskov Substitution: All generators implement IFieldGenerator
 * - Interface Segregation: Focused, minimal interfaces
 * - Dependency Inversion: Depends on abstractions (interfaces), not concretions
 */

import { DataGeneratorService } from '@/services/DataGeneratorService';
import { ResourceField } from '@/types';

// Re-export constants for backward compatibility
export { FAKER_METHODS, VALID_STATUS_CODES } from '@/constants/fieldTypes';

// Create a singleton instance of the data generator service
const dataGeneratorService = new DataGeneratorService();

/**
 * Generate a value for a single field
 * @param field - The field configuration
 * @param allData - Optional context data for relations
 * @returns The generated value
 * 
 * This function now delegates to the new DataGeneratorService which uses
 * the Strategy Pattern to handle different field types.
 */
export function generateFieldValue(field: ResourceField, allData?: any): any {
    return dataGeneratorService.generateFieldValue(field, allData);
}
