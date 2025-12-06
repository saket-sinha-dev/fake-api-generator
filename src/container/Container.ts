/**
 * Dependency Injection Container
 * 
 * Manages all service and repository instances
 * Following the Dependency Inversion Principle
 * Provides a centralized way to create and access dependencies
 * 
 * Benefits:
 * - Single source of truth for dependencies
 * - Easy to swap implementations for testing
 * - Manages singleton instances
 * - Reduces coupling between components
 */

// Repositories
import { ProjectRepository } from '@/repositories/ProjectRepository';
import { ResourceRepository } from '@/repositories/ResourceRepository';
import { ApiRepository } from '@/repositories/ApiRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { DatabaseRepository } from '@/repositories/DatabaseRepository';

// Services
import { ProjectService } from '@/services/ProjectService';
import { ResourceService } from '@/services/ResourceService';
import { DataGeneratorService } from '@/services/DataGeneratorService';

/**
 * Dependency injection container
 * Implements the Singleton pattern
 */
export class Container {
  private static instance: Container;

  // Repository instances
  private projectRepository!: ProjectRepository;
  private resourceRepository!: ResourceRepository;
  private apiRepository!: ApiRepository;
  private userRepository!: UserRepository;
  private databaseRepository!: DatabaseRepository;

  // Service instances
  private projectService!: ProjectService;
  private resourceService!: ResourceService;
  private dataGeneratorService!: DataGeneratorService;

  private constructor() {
    this.initializeRepositories();
    this.initializeServices();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Initialize all repository instances
   */
  private initializeRepositories(): void {
    this.projectRepository = new ProjectRepository();
    this.resourceRepository = new ResourceRepository();
    this.apiRepository = new ApiRepository();
    this.userRepository = new UserRepository();
    this.databaseRepository = new DatabaseRepository();
  }

  /**
   * Initialize all service instances with their dependencies
   */
  private initializeServices(): void {
    this.dataGeneratorService = new DataGeneratorService();
    
    this.projectService = new ProjectService(this.projectRepository);
    
    this.resourceService = new ResourceService(
      this.resourceRepository,
      this.databaseRepository,
      this.dataGeneratorService
    );
  }

  // Repository getters
  getProjectRepository(): ProjectRepository {
    return this.projectRepository;
  }

  getResourceRepository(): ResourceRepository {
    return this.resourceRepository;
  }

  getApiRepository(): ApiRepository {
    return this.apiRepository;
  }

  getUserRepository(): UserRepository {
    return this.userRepository;
  }

  getDatabaseRepository(): DatabaseRepository {
    return this.databaseRepository;
  }

  // Service getters
  getProjectService(): ProjectService {
    return this.projectService;
  }

  getResourceService(): ResourceService {
    return this.resourceService;
  }

  getDataGeneratorService(): DataGeneratorService {
    return this.dataGeneratorService;
  }

  /**
   * Reset container (useful for testing)
   */
  static reset(): void {
    Container.instance = new Container();
  }
}

// Export a convenience function to get the container
export function getContainer(): Container {
  return Container.getInstance();
}

// Export individual getters for convenience
export function getProjectService(): ProjectService {
  return Container.getInstance().getProjectService();
}

export function getResourceService(): ResourceService {
  return Container.getInstance().getResourceService();
}

export function getDataGeneratorService(): DataGeneratorService {
  return Container.getInstance().getDataGeneratorService();
}

export function getProjectRepository(): ProjectRepository {
  return Container.getInstance().getProjectRepository();
}

export function getResourceRepository(): ResourceRepository {
  return Container.getInstance().getResourceRepository();
}

export function getApiRepository(): ApiRepository {
  return Container.getInstance().getApiRepository();
}

export function getUserRepository(): UserRepository {
  return Container.getInstance().getUserRepository();
}

export function getDatabaseRepository(): DatabaseRepository {
  return Container.getInstance().getDatabaseRepository();
}
