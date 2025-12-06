import { NextResponse } from 'next/server';
import { MockApi as MockApiType, Resource as ResourceType } from '@/types';
import { match } from 'path-to-regexp';
import connectDB from '@/lib/mongodb';
import { API, Resource, Database } from '@/models';

async function triggerWebhook(url: string, data: any) {
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (e) {
        console.error('Webhook error:', e);
    }
}

// Helper to get nested value from object using path like "data.isEligible"
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper to evaluate condition
async function evaluateCondition(
    condition: any,
    request: Request,
    requestBody: any,
    url: URL,
    pathParams?: Record<string, string>
): Promise<boolean> {
    const { type, key, operator, value, dependentApiId, dependentApiPath } = condition;

    let actualValue: any;

    // Get the actual value based on condition type
    if (type === 'header') {
        actualValue = request.headers.get(key || '');
    } else if (type === 'query') {
        actualValue = url.searchParams.get(key || '');
    } else if (type === 'body') {
        actualValue = key ? getNestedValue(requestBody, key) : requestBody;
    } else if (type === 'dependentApi') {
        // Call the dependent API first
        if (!dependentApiId) return false;
        
        try {
            const dependentApi = await API.findOne({ id: dependentApiId }).lean();
            if (!dependentApi) return false;

            // Build the dependent API URL
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            let dependentPath = dependentApi.path;
            
            // Create a map to store values that can be used for path parameter replacement
            const availableValues: Record<string, string> = {
                ...pathParams,
                ...(requestBody || {}),
            };
            
            // Add query params to available values
            url.searchParams.forEach((value, key) => {
                availableValues[key] = value;
            });
            
            // Replace path parameters (e.g., :versionId) with actual values
            const pathParamMatches = dependentPath.match(/:(\w+)/g);
            if (pathParamMatches) {
                // First, check if we need to extract values from a response
                // by making a preliminary API call (for chained dependent APIs)
                let intermediateData: any = null;
                
                for (const paramWithColon of pathParamMatches) {
                    const paramName = paramWithColon.substring(1); // Remove the ':'
                    
                    // If we don't have this value yet, try to extract it from dependent API response
                    if (!availableValues[paramName]) {
                        // Make a call without path params to get the data we need
                        const tempPath = dependentPath.split(':')[0]; // Get path before first ':'
                        
                        if (tempPath !== dependentPath) {
                            // This is a path with parameters, try calling without them first
                            const tempUrl = new URL(`${baseUrl}/api/v1${tempPath.replace(/\/$/, '')}`);
                            
                            // Copy query parameters
                            url.searchParams.forEach((value, key) => {
                                tempUrl.searchParams.set(key, value);
                            });
                            
                            console.log('🔄 Pre-calling API to get path param values:', tempUrl.toString());
                            
                            const preResponse = await fetch(tempUrl.toString(), {
                                method: dependentApi.method,
                                headers: request.headers as any,
                            });
                            
                            if (preResponse.ok) {
                                intermediateData = await preResponse.json();
                                console.log('✅ Pre-call response received');
                                
                                // Try to extract versionId from first item in array
                                if (Array.isArray(intermediateData) && intermediateData.length > 0) {
                                    const firstItem = intermediateData[0];
                                    if (firstItem[paramName]) {
                                        availableValues[paramName] = String(firstItem[paramName]);
                                        console.log(`📌 Extracted ${paramName} = ${availableValues[paramName]} from array response`);
                                    }
                                } else if (intermediateData[paramName]) {
                                    availableValues[paramName] = String(intermediateData[paramName]);
                                    console.log(`📌 Extracted ${paramName} = ${availableValues[paramName]} from response`);
                                }
                            }
                        }
                    }
                }
                
                // Now replace all path parameters with available values
                pathParamMatches.forEach((paramWithColon: string) => {
                    const paramName = paramWithColon.substring(1);
                    const paramValue = availableValues[paramName];
                    
                    if (paramValue) {
                        dependentPath = dependentPath.replace(paramWithColon, paramValue);
                        console.log(`🔧 Replaced ${paramWithColon} with ${paramValue}`);
                    }
                });
            }
            
            // Build full URL with query parameters from original request
            const dependentUrl = new URL(`${baseUrl}/api/v1${dependentPath}`);
            
            // Copy all query parameters from the original request to dependent API
            url.searchParams.forEach((value, key) => {
                dependentUrl.searchParams.set(key, value);
            });

            console.log('🔄 Calling dependent API:', dependentUrl.toString());

            const dependentResponse = await fetch(dependentUrl.toString(), {
                method: dependentApi.method,
                headers: request.headers as any,
            });

            if (!dependentResponse.ok) {
                console.error('❌ Dependent API failed with status:', dependentResponse.status);
                return false;
            }

            const dependentData = await dependentResponse.json();
            console.log('✅ Dependent API response:', JSON.stringify(dependentData).substring(0, 200));
            
            actualValue = dependentApiPath ? getNestedValue(dependentData, dependentApiPath) : dependentData;
            console.log(`📊 Extracted value from path "${dependentApiPath}":`, actualValue);
        } catch (e) {
            console.error('❌ Dependent API call failed:', e);
            return false;
        }
    }

    // Evaluate the operator
    switch (operator) {
        case 'equals':
            return actualValue == value;
        case 'notEquals':
            return actualValue != value;
        case 'contains':
            return typeof actualValue === 'string' && actualValue.includes(value);
        case 'greaterThan':
            return Number(actualValue) > Number(value);
        case 'lessThan':
            return Number(actualValue) < Number(value);
        case 'exists':
            return actualValue !== null && actualValue !== undefined;
        default:
            return false;
    }
}

async function handleRequest(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    try {
        const { slug } = await params;
        await connectDB();

        const requestMethod = request.method;
        const requestPath = '/' + slug.join('/');
        const url = new URL(request.url);

        // Try to match custom API first
        const apis = await API.find().lean<MockApiType[]>();
        const api = apis.find(a => {
            if (a.method !== requestMethod) return false;
            if (a.path === requestPath) return true;

            try {
                const fn = match(a.path, { decode: decodeURIComponent });
                return fn(requestPath) !== false;
            } catch (e) {
                return false;
            }
        });

        if (api) {
            // Extract path parameters if the API path has dynamic segments
            let pathParams: Record<string, string> = {};
            try {
                const fn = match(api.path, { decode: decodeURIComponent });
                const matchResult = fn(requestPath);
                if (matchResult && typeof matchResult === 'object' && 'params' in matchResult) {
                    pathParams = matchResult.params as Record<string, string>;
                }
            } catch (e) {
                // No path params
            }

            // Get request body if needed
            const requestBody = requestMethod !== 'GET' && requestMethod !== 'HEAD' 
                ? await request.clone().json().catch(() => null)
                : null;

            // Trigger webhook if configured
            if (api.webhookUrl) {
                triggerWebhook(api.webhookUrl, { method: requestMethod, path: requestPath, body: requestBody });
            }

            // Check if conditional response is configured
            if (api.conditionalResponse) {
                const { condition, responseIfTrue, responseIfFalse, statusCodeIfTrue, statusCodeIfFalse } = api.conditionalResponse;
                
                const conditionMet = await evaluateCondition(condition, request, requestBody, url, pathParams);
                
                const response = conditionMet ? responseIfTrue : responseIfFalse;
                const statusCode = conditionMet 
                    ? (statusCodeIfTrue || api.statusCode) 
                    : (statusCodeIfFalse || api.statusCode);

                // Handle null response body
                if (response === null) {
                    return new NextResponse(null, { status: statusCode });
                }

                return NextResponse.json(response, { status: statusCode });
            }

            // Handle null response body (e.g., 204 No Content)
            if (api.responseBody === null) {
                return new NextResponse(null, { status: api.statusCode });
            }

            return NextResponse.json(api.responseBody, { status: api.statusCode });
        }

        // Try to match resource-based endpoint
        const resourceName = slug[0];
        const resources = await Resource.find().lean<ResourceType[]>();
        const resource = resources.find(r => r.name === resourceName);

        if (resource) {
            // Get data for this resource from Database collection
            const dbRecord = await Database.findOne({ resourceName }).lean();
            if (!dbRecord || !dbRecord.data) {
                return NextResponse.json({ error: 'No data generated for this resource yet' }, { status: 404 });
            }

            let data = [...dbRecord.data];
            const itemId = slug[1];

            // Handle specific item requests (GET /users/123, PUT /users/123, DELETE /users/123)
            if (itemId && itemId !== 'undefined') {
                const item = data.find(d => d.id === itemId);

                if (requestMethod === 'GET') {
                    if (!item) {
                        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
                    }
                    return NextResponse.json(item);
                }

                if (requestMethod === 'PUT' || requestMethod === 'PATCH') {
                    if (!item) {
                        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
                    }
                    const body = await request.json();
                    const updatedItem = { ...item, ...body };
                    const index = data.findIndex(d => d.id === itemId);
                    data[index] = updatedItem;
                    await Database.findOneAndUpdate(
                        { resourceName },
                        { data },
                        { upsert: true }
                    );
                    return NextResponse.json(updatedItem);
                }

                if (requestMethod === 'DELETE') {
                    if (!item) {
                        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
                    }
                    data = data.filter(d => d.id !== itemId);
                    await Database.findOneAndUpdate(
                        { resourceName },
                        { data },
                        { upsert: true }
                    );
                    return NextResponse.json({ success: true });
                }
            }

            // Handle collection requests (GET /users, POST /users)
            if (requestMethod === 'GET') {
                // Advanced Filtering
                const filters = Object.fromEntries(url.searchParams.entries());
                Object.keys(filters).forEach(key => {
                    // Skip special query params
                    if (['_page', '_limit', '_sort', '_order', '_embed', '_expand', '_search'].includes(key)) {
                        return;
                    }

                    // Handle operators in query params
                    // Supports: _gte, _lte, _gt, _lt, _ne (e.g., age_gte=18)
                    const operatorMatch = key.match(/^(.+)_(gte|lte|gt|lt|ne)$/);
                    
                    if (operatorMatch) {
                        const [, field, operator] = operatorMatch;
                        const filterValue = parseFloat(filters[key]) || filters[key];
                        
                        data = data.filter(item => {
                            const value = parseFloat(item[field]) || item[field];
                            switch (operator) {
                                case 'gte': return value >= filterValue;
                                case 'lte': return value <= filterValue;
                                case 'gt': return value > filterValue;
                                case 'lt': return value < filterValue;
                                case 'ne': return value != filterValue;
                                default: return true;
                            }
                        });
                    } else {
                        // Standard equality/contains filtering
                        const filterValue = filters[key];
                        data = data.filter(item => {
                            const value = item[key];
                            
                            // Handle undefined/null
                            if (value === undefined || value === null) return false;
                            
                            // String contains (case-insensitive)
                            if (typeof value === 'string') {
                                return value.toLowerCase().includes(filterValue.toLowerCase());
                            }
                            
                            // Exact match for numbers and booleans
                            if (typeof value === 'number') {
                                return value == parseFloat(filterValue);
                            }
                            
                            if (typeof value === 'boolean') {
                                return value.toString() === filterValue.toLowerCase();
                            }
                            
                            // Array contains
                            if (Array.isArray(value)) {
                                return value.some(v => 
                                    typeof v === 'string' 
                                        ? v.toLowerCase().includes(filterValue.toLowerCase())
                                        : v == filterValue
                                );
                            }
                            
                            // Fallback to loose equality
                            return value == filterValue;
                        });
                    }
                });

                // Full-text search across all fields
                const searchTerm = url.searchParams.get('_search');
                if (searchTerm) {
                    const lowerSearch = searchTerm.toLowerCase();
                    data = data.filter(item => {
                        return Object.values(item).some(value => {
                            if (typeof value === 'string') {
                                return value.toLowerCase().includes(lowerSearch);
                            }
                            if (typeof value === 'number') {
                                return value.toString().includes(lowerSearch);
                            }
                            return false;
                        });
                    });
                }

                // Sorting (supports multiple fields: _sort=name,age&_order=asc,desc)
                const sortBy = url.searchParams.get('_sort');
                const orderParam = url.searchParams.get('_order') || 'asc';
                
                if (sortBy) {
                    const sortFields = sortBy.split(',');
                    const orders = orderParam.split(',');
                    
                    data.sort((a, b) => {
                        for (let i = 0; i < sortFields.length; i++) {
                            const field = sortFields[i].trim();
                            const order = (orders[i] || 'asc').trim();
                            
                            const aVal = a[field];
                            const bVal = b[field];
                            
                            // Handle null/undefined
                            if (aVal === null || aVal === undefined) return 1;
                            if (bVal === null || bVal === undefined) return -1;
                            
                            // Compare values
                            if (aVal < bVal) return order === 'asc' ? -1 : 1;
                            if (aVal > bVal) return order === 'asc' ? 1 : -1;
                        }
                        return 0;
                    });
                }

                // Pagination
                const page = parseInt(url.searchParams.get('_page') || '1');
                const limit = parseInt(url.searchParams.get('_limit') || '10');
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedData = data.slice(startIndex, endIndex);

                // Embed related resources (e.g., ?_embed=posts for /users)
                const embed = url.searchParams.get('_embed');
                if (embed) {
                    const embedResources = embed.split(',');
                    for (const embedResource of embedResources) {
                        const embedData = await Database.findOne({ resourceName: embedResource.trim() }).lean();
                        if (embedData && embedData.data) {
                            paginatedData.forEach(item => {
                                // Find related items by matching field (e.g., userId)
                                const relatedField = `${resourceName.slice(0, -1)}Id`; // users -> userId
                                item[embedResource] = embedData.data.filter((r: any) => r[relatedField] === item.id);
                            });
                        }
                    }
                }

                // Expand related resources (e.g., ?_expand=user for /posts)
                const expand = url.searchParams.get('_expand');
                if (expand) {
                    const expandResources = expand.split(',');
                    for (const expandResource of expandResources) {
                        const expandData = await Database.findOne({ resourceName: expandResource.trim() }).lean();
                        if (expandData && expandData.data) {
                            paginatedData.forEach(item => {
                                // Find parent item by matching field (e.g., userId in post)
                                const relatedField = `${expandResource.slice(0, -1)}Id`; // users -> userId
                                const relatedItem = expandData.data.find((r: any) => r.id === item[relatedField]);
                                if (relatedItem) {
                                    item[expandResource.slice(0, -1)] = relatedItem; // Singular form
                                }
                            });
                        }
                    }
                }

                return NextResponse.json({
                    data: paginatedData,
                    pagination: {
                        page,
                        limit,
                        total: data.length,
                        totalPages: Math.ceil(data.length / limit),
                    }
                });
            }

            if (requestMethod === 'POST') {
                const body = await request.json();
                const newItem = {
                    id: crypto.randomUUID(),
                    ...body,
                    createdAt: new Date().toISOString(),
                };
                data.push(newItem);
                await Database.findOneAndUpdate(
                    { resourceName },
                    { data },
                    { upsert: true }
                );
                return NextResponse.json(newItem, { status: 201 });
            }
        }

        // Provide helpful error message
        const availableResources = resources.map(r => r.name);
        const availableApis = apis.map(a => `${a.method} ${a.path}`);
        
        return NextResponse.json(
            { 
                error: `Mock API not found for ${requestMethod} ${requestPath}`,
                hint: requestPath.includes('/') && slug.length > 1 
                    ? 'For multi-segment paths like "/devices/chart", create a Custom API instead of a Resource.'
                    : availableResources.length > 0 
                        ? `Available resources: ${availableResources.join(', ')}`
                        : 'No resources or custom APIs created yet.',
                availableResources: availableResources.length > 0 ? availableResources : undefined,
                availableApis: availableApis.length > 0 ? availableApis : undefined
            },
            { status: 404 }
        );
    } catch (error) {
        console.error('Error handling v1 request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export {
    handleRequest as GET,
    handleRequest as POST,
    handleRequest as PUT,
    handleRequest as DELETE,
    handleRequest as PATCH,
    handleRequest as OPTIONS,
    handleRequest as HEAD
};
