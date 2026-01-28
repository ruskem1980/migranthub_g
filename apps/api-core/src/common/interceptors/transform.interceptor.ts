import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    path: string;
    version: string;
  };
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    timestamp: string;
    path: string;
    version: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | PaginatedResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | PaginatedResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Skip transformation for health checks
        if (request.url.includes('/health')) {
          return data;
        }

        // Handle paginated responses
        if (this.isPaginatedData(data)) {
          return {
            data: data.items,
            meta: {
              timestamp: new Date().toISOString(),
              path: request.url,
              version: 'v1',
              pagination: data.pagination,
            },
          } as PaginatedResponse<T>;
        }

        // Standard response
        return {
          data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            version: 'v1',
          },
        } as ApiResponse<T>;
      }),
    );
  }

  private isPaginatedData(data: unknown): data is PaginatedData<unknown> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'items' in data &&
      'pagination' in data &&
      Array.isArray((data as PaginatedData<unknown>).items)
    );
  }
}
