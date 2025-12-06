import { IService, ServiceResult, ValidationResult } from '@/interfaces/IService';
import { ProjectRepository } from '@/repositories/ProjectRepository';
import { IProject } from '@/models';
import { validateRequiredFields, sanitizeString } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

/**
 * Project service
 * Handles all business logic related to projects
 * Following Single Responsibility Principle - only handles project operations
 */
export class ProjectService implements IService {
  constructor(private projectRepository: ProjectRepository) {}

  getName(): string {
    return 'ProjectService';
  }

  /**
   * Get all projects for a user (owned or collaborating)
   */
  async getProjectsForUser(email: string): Promise<ServiceResult<IProject[]>> {
    try {
      const projects = await this.projectRepository.findByUser(email);
      
      logger.info(`Found ${projects.length} projects for user`, { email });
      
      return {
        success: true,
        data: projects,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error fetching projects', error);
      return {
        success: false,
        error: 'Failed to fetch projects',
        statusCode: 500
      };
    }
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(id: string, userEmail: string): Promise<ServiceResult<IProject>> {
    try {
      // Check if user has access to this project
      const hasAccess = await this.projectRepository.hasAccess(id, userEmail);
      
      if (!hasAccess) {
        return {
          success: false,
          error: 'Project not found or access denied',
          statusCode: 404
        };
      }

      const project = await this.projectRepository.findById(id);
      
      if (!project) {
        return {
          success: false,
          error: 'Project not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: project,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error fetching project', error);
      return {
        success: false,
        error: 'Failed to fetch project',
        statusCode: 500
      };
    }
  }

  /**
   * Create a new project
   */
  async createProject(
    name: string,
    userId: string,
    description?: string
  ): Promise<ServiceResult<IProject>> {
    try {
      // Validate required fields
      const validation = this.validateProjectData({ name });
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          statusCode: 400
        };
      }

      // Sanitize inputs
      const sanitizedName = sanitizeString(name, 100);
      const sanitizedDescription = description ? sanitizeString(description, 500) : '';

      if (!sanitizedName) {
        return {
          success: false,
          error: 'Project name cannot be empty',
          statusCode: 400
        };
      }

      // Check for duplicate name
      const exists = await this.projectRepository.nameExistsForUser(userId, sanitizedName);
      
      if (exists) {
        logger.warn('Duplicate project name attempted', { name: sanitizedName, userId });
        return {
          success: false,
          error: 'Project with this name already exists',
          statusCode: 409
        };
      }

      // Create project
      const project = await this.projectRepository.create({
        id: randomUUID(),
        name: sanitizedName,
        description: sanitizedDescription,
        userId,
        collaborators: [],
        isPublic: false
      } as Partial<IProject>);

      logger.info('Project created successfully', { id: project.id, userId });

      return {
        success: true,
        data: project,
        statusCode: 201
      };
    } catch (error) {
      logger.error('Error creating project', error);
      return {
        success: false,
        error: 'Failed to create project',
        statusCode: 500
      };
    }
  }

  /**
   * Update a project
   */
  async updateProject(
    id: string,
    userEmail: string,
    updates: Partial<{ name: string; description: string; isPublic: boolean }>
  ): Promise<ServiceResult<IProject>> {
    try {
      // Check if user owns this project
      const project = await this.projectRepository.findById(id);
      
      if (!project) {
        return {
          success: false,
          error: 'Project not found',
          statusCode: 404
        };
      }

      if (project.userId !== userEmail) {
        return {
          success: false,
          error: 'Only the project owner can update it',
          statusCode: 403
        };
      }

      // Sanitize inputs
      const sanitizedUpdates: any = {};
      
      if (updates.name) {
        const sanitizedName = sanitizeString(updates.name, 100);
        if (!sanitizedName) {
          return {
            success: false,
            error: 'Project name cannot be empty',
            statusCode: 400
          };
        }
        
        // Check for duplicate name
        const nameExists = await this.projectRepository.nameExistsForUser(userEmail, sanitizedName);
        if (nameExists && project.name !== sanitizedName) {
          return {
            success: false,
            error: 'Project with this name already exists',
            statusCode: 409
          };
        }
        
        sanitizedUpdates.name = sanitizedName;
      }

      if (updates.description !== undefined) {
        sanitizedUpdates.description = updates.description ? sanitizeString(updates.description, 500) : '';
      }

      if (updates.isPublic !== undefined) {
        sanitizedUpdates.isPublic = updates.isPublic;
      }

      const updatedProject = await this.projectRepository.update(id, sanitizedUpdates);

      if (!updatedProject) {
        return {
          success: false,
          error: 'Failed to update project',
          statusCode: 500
        };
      }

      logger.info('Project updated successfully', { id });

      return {
        success: true,
        data: updatedProject,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error updating project', error);
      return {
        success: false,
        error: 'Failed to update project',
        statusCode: 500
      };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string, userEmail: string): Promise<ServiceResult<void>> {
    try {
      const project = await this.projectRepository.findById(id);
      
      if (!project) {
        return {
          success: false,
          error: 'Project not found',
          statusCode: 404
        };
      }

      if (project.userId !== userEmail) {
        return {
          success: false,
          error: 'Only the project owner can delete it',
          statusCode: 403
        };
      }

      const deleted = await this.projectRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          error: 'Failed to delete project',
          statusCode: 500
        };
      }

      logger.info('Project deleted successfully', { id });

      return {
        success: true,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error deleting project', error);
      return {
        success: false,
        error: 'Failed to delete project',
        statusCode: 500
      };
    }
  }

  /**
   * Add a collaborator to a project
   */
  async addCollaborator(projectId: string, ownerEmail: string, collaboratorEmail: string): Promise<ServiceResult<IProject>> {
    try {
      const project = await this.projectRepository.findById(projectId);
      
      if (!project) {
        return {
          success: false,
          error: 'Project not found',
          statusCode: 404
        };
      }

      if (project.userId !== ownerEmail) {
        return {
          success: false,
          error: 'Only the project owner can add collaborators',
          statusCode: 403
        };
      }

      if (project.userId === collaboratorEmail) {
        return {
          success: false,
          error: 'Owner is already a collaborator',
          statusCode: 400
        };
      }

      if (project.collaborators?.includes(collaboratorEmail)) {
        return {
          success: false,
          error: 'User is already a collaborator',
          statusCode: 409
        };
      }

      const updatedProject = await this.projectRepository.addCollaborator(projectId, collaboratorEmail);

      if (!updatedProject) {
        return {
          success: false,
          error: 'Failed to add collaborator',
          statusCode: 500
        };
      }

      logger.info('Collaborator added successfully', { projectId, collaboratorEmail });

      return {
        success: true,
        data: updatedProject,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error adding collaborator', error);
      return {
        success: false,
        error: 'Failed to add collaborator',
        statusCode: 500
      };
    }
  }

  /**
   * Remove a collaborator from a project
   */
  async removeCollaborator(projectId: string, ownerEmail: string, collaboratorEmail: string): Promise<ServiceResult<IProject>> {
    try {
      const project = await this.projectRepository.findById(projectId);
      
      if (!project) {
        return {
          success: false,
          error: 'Project not found',
          statusCode: 404
        };
      }

      if (project.userId !== ownerEmail) {
        return {
          success: false,
          error: 'Only the project owner can remove collaborators',
          statusCode: 403
        };
      }

      const updatedProject = await this.projectRepository.removeCollaborator(projectId, collaboratorEmail);

      if (!updatedProject) {
        return {
          success: false,
          error: 'Failed to remove collaborator',
          statusCode: 500
        };
      }

      logger.info('Collaborator removed successfully', { projectId, collaboratorEmail });

      return {
        success: true,
        data: updatedProject,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error removing collaborator', error);
      return {
        success: false,
        error: 'Failed to remove collaborator',
        statusCode: 500
      };
    }
  }

  /**
   * Validate project data
   */
  private validateProjectData(data: any): ValidationResult {
    const validation = validateRequiredFields(data, ['name']);
    return validation;
  }
}
