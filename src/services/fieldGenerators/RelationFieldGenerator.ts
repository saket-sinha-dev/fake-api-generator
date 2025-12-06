import { IFieldGenerator } from '@/interfaces/IFieldGenerator';
import { FIELD_TYPES } from '@/constants/fieldTypes';

/**
 * Relation field generator
 * Generates foreign key values by selecting random IDs from related data
 */
export class RelationFieldGenerator implements IFieldGenerator {
  constructor(private faker: any) {}

  generate(field: any, allData?: any): string | number | null {
    // If no data to relate to, return null
    if (!allData || !field.relationTo) {
      return null;
    }

    const relatedData = allData[field.relationTo];
    
    // If related resource has no data, return null
    if (!relatedData || relatedData.length === 0) {
      return null;
    }

    // Pick a random record from the related resource
    const randomRecord = this.faker.helpers.arrayElement(relatedData);
    
    // Return its ID
    return randomRecord?.id || null;
  }

  getType(): string {
    return FIELD_TYPES.RELATION;
  }
}
