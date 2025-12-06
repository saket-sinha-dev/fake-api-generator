import { BaseRepository } from './BaseRepository';
import { API, IAPI } from '@/models';

/**
 * API repository
 * Handles data access for custom API entities
 */
export class ApiRepository extends BaseRepository<IAPI> {
  constructor() {
    super(API, 'API');
  }

  /**
   * Find APIs by project ID
   */
  async findByProject(projectId: string): Promise<IAPI[]> {
    await this.ensureConnection();
    return this.find({ projectId });
  }

  /**
   * Find API by method and path
   */
  async findByMethodAndPath(method: string, path: string): Promise<IAPI | null> {
    await this.ensureConnection();
    return this.findOne({ method, path });
  }

  /**
   * Check if an API with the same method and path exists
   */
  async methodAndPathExists(method: string, path: string, excludeId?: string): Promise<boolean> {
    await this.ensureConnection();
    
    const filter: any = { method, path };
    if (excludeId) {
      filter.id = { $ne: excludeId };
    }
    
    return this.exists(filter);
  }

  /**
   * Delete all APIs for a project
   */
  async deleteByProject(projectId: string): Promise<number> {
    await this.ensureConnection();
    
    const result = await API.deleteMany({ projectId });
    return result.deletedCount;
  }

  /**
   * Find APIs by webhook URL
   */
  async findByWebhook(webhookUrl: string): Promise<IAPI[]> {
    await this.ensureConnection();
    return this.find({ webhookUrl });
  }
}
