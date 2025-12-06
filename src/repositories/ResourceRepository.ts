import { BaseRepository } from './BaseRepository';
import { Resource, IResource } from '@/models';

/**
 * Resource repository
 * Handles data access for Resource entities
 */
export class ResourceRepository extends BaseRepository<IResource> {
  constructor() {
    super(Resource, 'Resource');
  }

  /**
   * Find resources by project ID
   */
  async findByProject(projectId: string): Promise<IResource[]> {
    await this.ensureConnection();
    return this.find({ projectId });
  }

  /**
   * Find resource by name and project
   */
  async findByNameAndProject(name: string, projectId: string): Promise<IResource | null> {
    await this.ensureConnection();
    
    return this.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      projectId
    });
  }

  /**
   * Check if resource name exists in project
   */
  async nameExistsInProject(name: string, projectId: string): Promise<boolean> {
    await this.ensureConnection();
    
    return this.exists({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      projectId
    });
  }

  /**
   * Delete all resources for a project
   */
  async deleteByProject(projectId: string): Promise<number> {
    await this.ensureConnection();
    
    const result = await Resource.deleteMany({ projectId });
    return result.deletedCount;
  }
}
