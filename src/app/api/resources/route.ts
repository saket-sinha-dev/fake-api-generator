/**
 * Resources API Route
 * 
 * Refactored to follow SOLID principles:
 * - Uses ResourceService for business logic (Single Responsibility)
 * - Depends on abstractions via Container (Dependency Inversion)
 * - Route only handles HTTP concerns (separation of concerns)
 */

import { 
  successResponse, 
  createdResponse, 
  badRequestResponse, 
  conflictResponse,
  handleApiError 
} from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { getResourceService } from '@/container/Container';

export async function GET() {
    try {
        logger.logRequest('GET', '/api/resources');
        
        const resourceService = getResourceService();
        const result = await resourceService.getAllResources();

        if (!result.success) {
            return handleApiError(new Error(result.error));
        }

        return successResponse(result.data);
    } catch (error) {
        logger.error('Error fetching resources', error);
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        logger.logRequest('POST', '/api/resources');
        
        const body = await request.json();
        const { name, fields, projectId } = body;

        logger.debug('Received resource creation request', { 
            name, 
            fieldsType: typeof fields,
            isArray: Array.isArray(fields),
            projectId 
        });

        const resourceService = getResourceService();
        const result = await resourceService.createResource(name, fields, projectId);

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
        logger.error('Error creating resource', error);
        return handleApiError(error);
    }
}
