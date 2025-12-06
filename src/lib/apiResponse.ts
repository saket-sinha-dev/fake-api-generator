/**
 * Response utilities for consistent API responses
 * Provides standardized response formats and error handling
 */

import { NextResponse } from 'next/server';
import { HTTP_STATUS, ERROR_MESSAGES } from './constants';

/**
 * Standard API response structure
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Creates a success response
 */
export function successResponse<T>(
  data: T,
  status: number = HTTP_STATUS.OK,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Creates an error response
 */
export function errorResponse(
  error: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Creates a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
    { status: HTTP_STATUS.OK }
  );
}

/**
 * Handles common API errors and returns appropriate response
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  // Handle specific error types
  if (error instanceof Error) {
    // Mongoose validation errors
    if ('name' in error && error.name === 'ValidationError') {
      return errorResponse(
        `Validation error: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Mongoose duplicate key errors
    if ('code' in error && error.code === 11000) {
      return errorResponse(
        'A record with this value already exists',
        HTTP_STATUS.CONFLICT
      );
    }

    // JSON parse errors
    if (error instanceof SyntaxError) {
      return errorResponse(
        ERROR_MESSAGES.INVALID_JSON,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Generic error
  return errorResponse(
    ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(
  message: string = ERROR_MESSAGES.UNAUTHORIZED
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Forbidden response
 */
export function forbiddenResponse(
  message: string = ERROR_MESSAGES.FORBIDDEN
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.FORBIDDEN);
}

/**
 * Not found response
 */
export function notFoundResponse(
  message: string = ERROR_MESSAGES.NOT_FOUND
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.NOT_FOUND);
}

/**
 * Bad request response
 */
export function badRequestResponse(
  message: string = ERROR_MESSAGES.INVALID_INPUT
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.BAD_REQUEST);
}

/**
 * Conflict response
 */
export function conflictResponse(message: string): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.CONFLICT);
}

/**
 * Created response
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return successResponse(data, HTTP_STATUS.CREATED, message);
}

/**
 * No content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
}
