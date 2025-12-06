import { BaseRepository } from './BaseRepository';
import { Project, IProject } from '@/models';

/**
 * Project repository
 * Handles data access for Project entities
 * Extends BaseRepository with project-specific operations
 */
export class ProjectRepository extends BaseRepository<IProject> {
  constructor() {
    super(Project, 'Project');
  }

  /**
   * Find projects by user email (owner or collaborator)
   */
  async findByUser(email: string): Promise<IProject[]> {
    await this.ensureConnection();
    
    return this.find({
      $or: [
        { userId: email },
        { collaborators: email }
      ]
    });
  }

  /**
   * Find projects owned by a user
   */
  async findByOwner(userId: string): Promise<IProject[]> {
    await this.ensureConnection();
    return this.find({ userId });
  }

  /**
   * Check if a project name exists for a user
   */
  async nameExistsForUser(userId: string, name: string): Promise<boolean> {
    await this.ensureConnection();
    
    return this.exists({
      userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
  }

  /**
   * Add a collaborator to a project
   */
  async addCollaborator(projectId: string, email: string): Promise<IProject | null> {
    await this.ensureConnection();
    
    const query = Project.findOneAndUpdate(
      { id: projectId },
      { $addToSet: { collaborators: email } },
      { new: true }
    );
    
    // Check if lean method exists (real Mongoose query) before calling
    const result = typeof (query as any).lean === 'function' 
      ? await (query as any).lean()
      : await query;
    
    return result as IProject | null;
  }

  /**
   * Remove a collaborator from a project
   */
  async removeCollaborator(projectId: string, email: string): Promise<IProject | null> {
    await this.ensureConnection();
    
    const query = Project.findOneAndUpdate(
      { id: projectId },
      { $pull: { collaborators: email } },
      { new: true }
    );
    
    // Check if lean method exists (real Mongoose query) before calling
    const result = typeof (query as any).lean === 'function' 
      ? await (query as any).lean()
      : await query;
    
    return result as IProject | null;
  }

  /**
   * Check if user has access to a project (owner or collaborator)
   */
  async hasAccess(projectId: string, email: string): Promise<boolean> {
    await this.ensureConnection();
    
    return this.exists({
      id: projectId,
      $or: [
        { userId: email },
        { collaborators: email }
      ]
    });
  }
}
