import { IService, ServiceResult, ValidationResult } from '@/interfaces/IService';
import { ResourceRepository } from '@/repositories/ResourceRepository';
import { DatabaseRepository } from '@/repositories/DatabaseRepository';
import { IResource } from '@/models';
import { DataGeneratorService } from './DataGeneratorService';
import { validateRequiredFields, validateResourceName, isValidFieldType } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

/**
 * Resource service
 * Handles all business logic related to resources and data generation
 * Following Single Responsibility Principle
 */
export class ResourceService implements IService {
  constructor(
    private resourceRepository: ResourceRepository,
    private databaseRepository: DatabaseRepository,
    private dataGenerator: DataGeneratorService
  ) {}

  getName(): string {
    return 'ResourceService';
  }

  /**
   * Get all resources
   */
  async getAllResources(): Promise<ServiceResult<IResource[]>> {
    try {
      const resources = await this.resourceRepository.find();
      
      // Ensure fields is always an array for older documents
      resources.forEach(resource => {
        if (!Array.isArray(resource.fields)) {
          resource.fields = [];
        }
      });
      
      logger.info(`Fetched ${resources.length} resources`);
      
      return {
        success: true,
        data: resources,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error fetching resources', error);
      return {
        success: false,
        error: 'Failed to fetch resources',
        statusCode: 500
      };
    }
  }

  /**
   * Get resources by project ID
   */
  async getResourcesByProject(projectId: string): Promise<ServiceResult<IResource[]>> {
    try {
      const resources = await this.resourceRepository.findByProject(projectId);
      
      return {
        success: true,
        data: resources,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error fetching resources by project', error);
      return {
        success: false,
        error: 'Failed to fetch resources',
        statusCode: 500
      };
    }
  }

  /**
   * Get a single resource by ID
   */
  async getResourceById(id: string): Promise<ServiceResult<IResource>> {
    try {
      const resource = await this.resourceRepository.findById(id);
      
      if (!resource) {
        return {
          success: false,
          error: 'Resource not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: resource,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error fetching resource', error);
      return {
        success: false,
        error: 'Failed to fetch resource',
        statusCode: 500
      };
    }
  }

  /**
   * Create a new resource
   */
  async createResource(
    name: string,
    fields: any[],
    projectId: string
  ): Promise<ServiceResult<IResource>> {
    try {
      // Validate required fields
      const validation = this.validateResourceData({ name, fields, projectId });
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          statusCode: 400
        };
      }

      // Parse fields if it's a string
      let parsedFields = fields;
      if (typeof fields === 'string') {
        try {
          parsedFields = JSON.parse(fields);
        } catch (e) {
          return {
            success: false,
            error: 'Invalid fields format - must be valid JSON',
            statusCode: 400
          };
        }
      }

      // Ensure fields is an array
      if (!Array.isArray(parsedFields)) {
        return {
          success: false,
          error: 'Fields must be an array',
          statusCode: 400
        };
      }

      // Validate resource name
      const nameValidation = validateResourceName(name);
      if (!nameValidation.valid) {
        return {
          success: false,
          error: nameValidation.error,
          statusCode: 400
        };
      }

      // Validate each field
      for (const field of parsedFields) {
        if (!field.name || !field.type) {
          return {
            success: false,
            error: 'Each field must have a name and type',
            statusCode: 400
          };
        }

        if (!isValidFieldType(field.type)) {
          return {
            success: false,
            error: `Invalid field type: ${field.type}`,
            statusCode: 400
          };
        }

        // Ensure field has an ID
        if (!field.id) {
          field.id = randomUUID();
        }
      }

      // Check for duplicate name in project
      const exists = await this.resourceRepository.nameExistsInProject(name, projectId);
      
      if (exists) {
        logger.warn('Duplicate resource name attempted', { name, projectId });
        return {
          success: false,
          error: 'Resource with this name already exists in project',
          statusCode: 409
        };
      }

      // Create resource
      const resource = await this.resourceRepository.create({
        id: randomUUID(),
        name,
        fields: parsedFields,
        projectId,
        createdAt: new Date()
      } as Partial<IResource>);

      logger.info('Resource created successfully', { id: resource.id, name });

      return {
        success: true,
        data: resource,
        statusCode: 201
      };
    } catch (error) {
      logger.error('Error creating resource', error);
      return {
        success: false,
        error: 'Failed to create resource',
        statusCode: 500
      };
    }
  }

  /**
   * Update a resource
   */
  async updateResource(
    id: string,
    updates: Partial<{ name: string; fields: any[] }>
  ): Promise<ServiceResult<IResource>> {
    try {
      const resource = await this.resourceRepository.findById(id);
      
      if (!resource) {
        return {
          success: false,
          error: 'Resource not found',
          statusCode: 404
        };
      }

      const sanitizedUpdates: any = {};

      if (updates.name) {
        const nameValidation = validateResourceName(updates.name);
        if (!nameValidation.valid) {
          return {
            success: false,
            error: nameValidation.error,
            statusCode: 400
          };
        }

        // Check for duplicate name
        const nameExists = await this.resourceRepository.nameExistsInProject(updates.name, resource.projectId);
        if (nameExists && resource.name !== updates.name) {
          return {
            success: false,
            error: 'Resource with this name already exists in project',
            statusCode: 409
          };
        }

        sanitizedUpdates.name = updates.name;
      }

      if (updates.fields) {
        // Validate fields
        for (const field of updates.fields) {
          if (!field.name || !field.type) {
            return {
              success: false,
              error: 'Each field must have a name and type',
              statusCode: 400
            };
          }

          if (!isValidFieldType(field.type)) {
            return {
              success: false,
              error: `Invalid field type: ${field.type}`,
              statusCode: 400
            };
          }
        }

        sanitizedUpdates.fields = updates.fields;
      }

      const updatedResource = await this.resourceRepository.update(id, sanitizedUpdates);

      if (!updatedResource) {
        return {
          success: false,
          error: 'Failed to update resource',
          statusCode: 500
        };
      }

      logger.info('Resource updated successfully', { id });

      return {
        success: true,
        data: updatedResource,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error updating resource', error);
      return {
        success: false,
        error: 'Failed to update resource',
        statusCode: 500
      };
    }
  }

  /**
   * Delete a resource
   */
  async deleteResource(id: string): Promise<ServiceResult<void>> {
    try {
      const resource = await this.resourceRepository.findById(id);
      
      if (!resource) {
        return {
          success: false,
          error: 'Resource not found',
          statusCode: 404
        };
      }

      // Delete associated data
      await this.databaseRepository.deleteByResourceName(resource.name);

      // Delete resource
      const deleted = await this.resourceRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          error: 'Failed to delete resource',
          statusCode: 500
        };
      }

      logger.info('Resource deleted successfully', { id });

      return {
        success: true,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error deleting resource', error);
      return {
        success: false,
        error: 'Failed to delete resource',
        statusCode: 500
      };
    }
  }

  /**
   * Generate data for a resource
   */
  async generateData(resourceId: string, count: number = 10): Promise<ServiceResult<any[]>> {
    try {
      const resource = await this.resourceRepository.findById(resourceId);
      
      if (!resource) {
        return {
          success: false,
          error: 'Resource not found',
          statusCode: 404
        };
      }

      // Get all existing data for relations
      const allResources = await this.resourceRepository.find();
      const allData: any = {};
      
      for (const res of allResources) {
        const data = await this.databaseRepository.getData(res.name);
        allData[res.name] = data;
      }

      // Generate data
      const generatedData: any[] = [];
      
      for (let i = 0; i < count; i++) {
        const record: any = { id: randomUUID() };
        
        for (const field of resource.fields) {
          record[field.name] = this.dataGenerator.generateFieldValue(field, allData);
        }
        
        generatedData.push(record);
      }

      // Save generated data
      await this.databaseRepository.appendData(resource.name, generatedData);

      logger.info('Data generated successfully', { resourceId, count });

      return {
        success: true,
        data: generatedData,
        statusCode: 201
      };
    } catch (error) {
      logger.error('Error generating data', error);
      return {
        success: false,
        error: 'Failed to generate data',
        statusCode: 500
      };
    }
  }

  /**
   * Get data for a resource
   */
  async getResourceData(resourceName: string): Promise<ServiceResult<any[]>> {
    try {
      const data = await this.databaseRepository.getData(resourceName);
      
      return {
        success: true,
        data,
        statusCode: 200
      };
    } catch (error) {
      logger.error('Error fetching resource data', error);
      return {
        success: false,
        error: 'Failed to fetch resource data',
        statusCode: 500
      };
    }
  }

  /**
   * Validate resource data
   */
  private validateResourceData(data: any): ValidationResult {
    const validation = validateRequiredFields(data, ['name', 'fields', 'projectId']);
    return validation;
  }
}
