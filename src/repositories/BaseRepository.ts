import { IRepository } from '@/interfaces/IRepository';
import { Model, Document } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { logger } from '@/lib/logger';

/**
 * Base MongoDB repository implementation
 * Provides common CRUD operations for Mongoose models
 * Following the Repository Pattern to abstract data access
 * 
 * Generic type T represents the document interface
 */
export abstract class BaseRepository<T extends Document> implements IRepository<T> {
  constructor(
    protected model: Model<T>,
    protected modelName: string
  ) {}

  /**
   * Ensure database connection before operations
   */
  protected async ensureConnection(): Promise<void> {
    await connectDB();
  }

  async findById(id: string): Promise<T | null> {
    await this.ensureConnection();
    logger.logDbOperation('findById', this.modelName, { id });
    
    try {
      const query = this.model.findOne({ id } as any);
      // Check if lean method exists (real Mongoose query) before calling
      const result = typeof (query as any).lean === 'function' 
        ? await (query as any).lean()
        : await query;
      return result as T | null;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by id`, error);
      throw error;
    }
  }

  async find(filter?: Record<string, any>): Promise<T[]> {
    await this.ensureConnection();
    logger.logDbOperation('find', this.modelName, filter);
    
    try {
      const query = this.model.find(filter || {});
      // Check if lean method exists (real Mongoose query) before calling
      const results = typeof (query as any).lean === 'function' 
        ? await (query as any).lean()
        : await query;
      return results as T[];
    } catch (error) {
      logger.error(`Error finding ${this.modelName}`, error);
      throw error;
    }
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    await this.ensureConnection();
    logger.logDbOperation('findOne', this.modelName, filter);
    
    try {
      const query = this.model.findOne(filter);
      // Check if lean method exists (real Mongoose query) before calling
      const result = typeof (query as any).lean === 'function' 
        ? await (query as any).lean()
        : await query;
      return result as T | null;
    } catch (error) {
      logger.error(`Error finding one ${this.modelName}`, error);
      throw error;
    }
  }

  async create(data: Partial<T>): Promise<T> {
    await this.ensureConnection();
    logger.logDbOperation('create', this.modelName, data);
    
    try {
      const document = new this.model(data);
      const result = await document.save();
      return result as T;
    } catch (error) {
      logger.error(`Error creating ${this.modelName}`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.ensureConnection();
    logger.logDbOperation('update', this.modelName, { id, ...data });
    
    try {
      const query = this.model.findOneAndUpdate(
        { id } as any,
        data,
        { new: true }
      );
      // Check if lean method exists (real Mongoose query) before calling
      const result = typeof (query as any).lean === 'function' 
        ? await (query as any).lean()
        : await query;
      return result as T | null;
    } catch (error) {
      logger.error(`Error updating ${this.modelName}`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureConnection();
    logger.logDbOperation('delete', this.modelName, { id });
    
    try {
      const result = await this.model.deleteOne({ id } as any);
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Error deleting ${this.modelName}`, error);
      throw error;
    }
  }

  async exists(filter: Record<string, any>): Promise<boolean> {
    await this.ensureConnection();
    
    try {
      const count = await this.model.countDocuments(filter);
      return count > 0;
    } catch (error) {
      logger.error(`Error checking existence in ${this.modelName}`, error);
      throw error;
    }
  }

  async count(filter?: Record<string, any>): Promise<number> {
    await this.ensureConnection();
    
    try {
      return await this.model.countDocuments(filter || {});
    } catch (error) {
      logger.error(`Error counting ${this.modelName}`, error);
      throw error;
    }
  }
}
