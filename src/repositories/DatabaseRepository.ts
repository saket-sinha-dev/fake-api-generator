import { BaseRepository } from './BaseRepository';
import { Database, IDatabase } from '@/models';

/**
 * Database repository
 * Handles data access for generated resource data
 */
export class DatabaseRepository extends BaseRepository<IDatabase> {
  constructor() {
    super(Database, 'Database');
  }

  /**
   * Find data by resource name
   */
  async findByResourceName(resourceName: string): Promise<IDatabase | null> {
    await this.ensureConnection();
    return this.findOne({ resourceName });
  }

  /**
   * Get data for a resource
   */
  async getData(resourceName: string): Promise<any[]> {
    await this.ensureConnection();
    
    const result = await this.findByResourceName(resourceName);
    return result?.data || [];
  }

  /**
   * Set data for a resource (creates or updates)
   */
  async setData(resourceName: string, data: any[]): Promise<IDatabase> {
    await this.ensureConnection();
    
    const existing = await this.findByResourceName(resourceName);
    
    if (existing) {
      const result = await Database.findOneAndUpdate(
        { resourceName },
        { data, updatedAt: new Date() },
        { new: true }
      );
      return result as IDatabase;
    } else {
      return await this.create({ resourceName, data } as Partial<IDatabase>);
    }
  }

  /**
   * Append data to a resource
   */
  async appendData(resourceName: string, newData: any[]): Promise<IDatabase | null> {
    await this.ensureConnection();
    
    const result = await Database.findOneAndUpdate(
      { resourceName },
      { 
        $push: { data: { $each: newData } },
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );
    
    return result as IDatabase | null;
  }

  /**
   * Clear data for a resource
   */
  async clearData(resourceName: string): Promise<boolean> {
    await this.ensureConnection();
    
    const result = await Database.findOneAndUpdate(
      { resourceName },
      { data: [], updatedAt: new Date() },
      { new: true }
    );
    
    return !!result;
  }

  /**
   * Delete database entry for a resource
   */
  async deleteByResourceName(resourceName: string): Promise<boolean> {
    await this.ensureConnection();
    
    const result = await Database.deleteOne({ resourceName });
    return result.deletedCount > 0;
  }
}
