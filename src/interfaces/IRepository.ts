/**
 * Generic repository interface for data access
 * Abstracts away data layer details (MongoDB, file system, etc.)
 * Following the Dependency Inversion Principle
 */
export interface IRepository<T> {
  /**
   * Find a document by ID
   */
  findById(id: string): Promise<T | null>;
  
  /**
   * Find all documents matching the filter
   */
  find(filter?: Record<string, any>): Promise<T[]>;
  
  /**
   * Find one document matching the filter
   */
  findOne(filter: Record<string, any>): Promise<T | null>;
  
  /**
   * Create a new document
   */
  create(data: Partial<T>): Promise<T>;
  
  /**
   * Update a document by ID
   */
  update(id: string, data: Partial<T>): Promise<T | null>;
  
  /**
   * Delete a document by ID
   */
  delete(id: string): Promise<boolean>;
  
  /**
   * Check if a document exists
   */
  exists(filter: Record<string, any>): Promise<boolean>;
  
  /**
   * Count documents matching the filter
   */
  count(filter?: Record<string, any>): Promise<number>;
}
