/**
 * Projects API Route
 * 
 * Refactored to follow SOLID principles:
 * - Uses ProjectService for business logic (Single Responsibility)
 * - Depends on abstractions via Container (Dependency Inversion)
 * - Route only handles HTTP concerns (separation of concerns)
 */

import { validateSession } from '@/lib/authHelpers';
import { 
  successResponse, 
  createdResponse, 
  unauthorizedResponse, 
  badRequestResponse, 
  conflictResponse,
  handleApiError 
} from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { getProjectService } from '@/container/Container';

export async function GET() {
    try {
        logger.logRequest('GET', '/api/projects');
        
        const { valid, email, error } = await validateSession();
        if (!valid || !email) {
            return unauthorizedResponse(error);
        }

        const projectService = getProjectService();
        const result = await projectService.getProjectsForUser(email);

        if (!result.success) {
            return handleApiError(new Error(result.error));
        }

        return successResponse(result.data);
    } catch (error) {
        logger.error('Error fetching projects', error);
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        logger.logRequest('POST', '/api/projects');
        
        const { valid, email, error } = await validateSession();
        if (!valid || !email) {
            return unauthorizedResponse(error);
        }

        const body = await request.json();
        const { name, description } = body;

        const projectService = getProjectService();
        const result = await projectService.createProject(name, email, description);

        if (!result.success) {
            switch (result.statusCode) {
                case 400:
                    return badRequestResponse(result.error || 'Bad request');
                case 409:
                    return conflictResponse(result.error || 'Conflict');
                default:
                    return handleApiError(new Error(result.error || 'Unknown error'));
            }
        }

        return createdResponse(result.data);
    } catch (error) {
        logger.error('Error creating project', error);
        return handleApiError(error);
    }
}
