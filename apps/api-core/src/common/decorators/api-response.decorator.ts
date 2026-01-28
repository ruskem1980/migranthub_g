import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

// Response wrapper schema for Swagger
export const ApiResponseWrapper = <T extends Type>(dataDto: T) => {
  return applyDecorators(
    ApiExtraModels(dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', format: 'date-time' },
                  path: { type: 'string' },
                  version: { type: 'string' },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiCreatedWrapper = <T extends Type>(dataDto: T) => {
  return applyDecorators(
    ApiExtraModels(dataDto),
    ApiCreatedResponse({
      schema: {
        allOf: [
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', format: 'date-time' },
                  path: { type: 'string' },
                  version: { type: 'string' },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiPaginatedResponse = <T extends Type>(dataDto: T) => {
  return applyDecorators(
    ApiExtraModels(dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', format: 'date-time' },
                  path: { type: 'string' },
                  version: { type: 'string' },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'number' },
                      limit: { type: 'number' },
                      total: { type: 'number' },
                      totalPages: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiErrorResponse = (statusCode: number, description: string) => {
  return ApiResponse({
    status: statusCode,
    description,
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: statusCode },
        message: { type: 'string' },
        error: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string' },
        requestId: { type: 'string' },
      },
    },
  });
};

// Common error responses
export const ApiBadRequestResponse = () =>
  ApiErrorResponse(400, 'Bad Request - Invalid input data');

export const ApiUnauthorizedResponse = () =>
  ApiErrorResponse(401, 'Unauthorized - Authentication required');

export const ApiForbiddenResponse = () =>
  ApiErrorResponse(403, 'Forbidden - Insufficient permissions');

export const ApiNotFoundResponse = () =>
  ApiErrorResponse(404, 'Not Found - Resource does not exist');

export const ApiInternalServerErrorResponse = () => ApiErrorResponse(500, 'Internal Server Error');
