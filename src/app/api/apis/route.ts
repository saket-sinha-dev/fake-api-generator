import connectDB from '@/lib/mongodb';
import { API } from '@/models';
import { 
  successResponse, 
  createdResponse, 
  badRequestResponse, 
  conflictResponse,
  handleApiError 
} from '@/lib/apiResponse';
import { 
  validateRequiredFields, 
  validateApiPath, 
  isValidHttpMethod,
  isValidStatusCode,
  sanitizeString 
} from '@/lib/validation';
import { logger } from '@/lib/logger';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants';

export async function GET() {
    try {
        logger.logRequest('GET', '/api/apis');
        
        await connectDB();
        logger.logDbOperation('find', 'apis');
        
        const apis = await API.find().lean();
        
        logger.info(`Fetched ${apis.length} APIs`);
        return successResponse(apis);
    } catch (error) {
        logger.error('Error fetching APIs', error);
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        logger.logRequest('POST', '/api/apis');
        
        const body = await request.json();
        const { 
            path: apiPath, 
            method, 
            statusCode, 
            responseBody, 
            name, 
            webhookUrl, 
            projectId, 
            requestBody, 
            queryParams, 
            conditionalResponse 
        } = body;

        logger.debug('Creating API', { 
            path: apiPath, 
            method, 
            hasConditional: !!conditionalResponse 
        });

        // Validate required fields
        const validation = validateRequiredFields(body, ['path', 'method', 'projectId']);
        if (!validation.valid) {
            logger.logValidationError('required_fields', validation.error || '');
            return badRequestResponse(validation.error);
        }

        // Normalize path (add leading slash if missing) - only if path exists
        const normalizedPath = apiPath && typeof apiPath === 'string' && !apiPath.startsWith('/') 
            ? `/${apiPath}` 
            : apiPath;

        // Validate API path (after normalization)
        const pathValidation = validateApiPath(normalizedPath);
        if (!pathValidation.valid) {
            logger.logValidationError('path', pathValidation.error || '');
            return badRequestResponse(pathValidation.error);
        }

        // Validate HTTP method
        if (!isValidHttpMethod(method)) {
            logger.logValidationError('method', `Invalid HTTP method: ${method}`);
            return badRequestResponse(`Invalid HTTP method: ${method}`);
        }

        // Validate status code
        const finalStatusCode = statusCode || HTTP_STATUS.OK;
        if (!isValidStatusCode(finalStatusCode)) {
            logger.logValidationError('statusCode', `Invalid status code: ${finalStatusCode}`);
            return badRequestResponse(`Invalid status code: ${finalStatusCode}`);
        }

        // Sanitize name
        const sanitizedName = name ? sanitizeString(name, 100) : 'Untitled API';

        await connectDB();

        // Check for duplicate path+method combination
        const exists = await API.findOne({ 
            path: normalizedPath, 
            method: method.toUpperCase(),
            projectId 
        });
        
        if (exists) {
            logger.warn('Duplicate API endpoint attempted', { path: normalizedPath, method, projectId });
            return conflictResponse(ERROR_MESSAGES.DUPLICATE_API);
        }

        logger.logDbOperation('create', 'apis', { 
            path: normalizedPath, 
            method, 
            projectId,
            hasConditional: !!conditionalResponse 
        });
        
        const apiData: any = {
            id: crypto.randomUUID(),
            path: normalizedPath,
            method: method.toUpperCase(),
            statusCode: finalStatusCode,
            responseBody,
            name: sanitizedName,
            projectId,
            requestBody,
            queryParams,
            conditionalResponse,
        };
        
        if (webhookUrl) {
            apiData.webhookUrl = sanitizeString(webhookUrl, 500);
        }
        
        const newApi = (await API.create(apiData)) as any;

        logger.info('API created successfully', { 
            apiId: newApi.id, 
            path: normalizedPath,
            method: newApi.method,
            hasConditional: !!conditionalResponse 
        });
        
        return createdResponse(newApi);
    } catch (error) {
        logger.error('Error creating API', error);
        return handleApiError(error);
    }
}
