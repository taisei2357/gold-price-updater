/**
 * Enhanced Error Handler
 * アプリケーション全体のエラーハンドリングとロギング
 */

export interface ErrorLogEntry {
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: any;
  requestId?: string;
}

export class AppErrorHandler {
  private static logs: ErrorLogEntry[] = [];
  
  static logError(error: Error, context?: any, requestId?: string): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      context,
      requestId
    };
    
    this.logs.push(entry);
    
    // Keep only last 1000 entries
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    console.error('🚨 Application Error:', {
      message: error.message,
      stack: error.stack,
      context,
      requestId,
      timestamp: entry.timestamp.toISOString()
    });
  }
  
  static logWarning(message: string, context?: any): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date(),
      level: 'warning',
      message,
      context
    };
    
    this.logs.push(entry);
    console.warn('⚠️ Application Warning:', { message, context });
  }
  
  static logInfo(message: string, context?: any): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date(),
      level: 'info', 
      message,
      context
    };
    
    console.log('ℹ️ Application Info:', { message, context });
  }
  
  static getRecentLogs(limit = 100): ErrorLogEntry[] {
    return this.logs.slice(-limit);
  }
  
  static clearLogs(): void {
    this.logs = [];
  }
}

// Database connection error handling
export function handleDatabaseError(error: any): Response {
  AppErrorHandler.logError(error, { type: 'database' });
  
  return new Response(
    JSON.stringify({ 
      error: 'Database connection failed',
      message: 'Please try again later',
      timestamp: new Date().toISOString()
    }),
    { 
      status: 503,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
}

// GraphQL error handling
export function handleGraphQLError(error: any, operation?: string): Response {
  AppErrorHandler.logError(error, { 
    type: 'graphql',
    operation
  });
  
  return new Response(
    JSON.stringify({ 
      error: 'GraphQL operation failed',
      operation,
      message: 'Please check your Shopify connection',
      timestamp: new Date().toISOString()
    }),
    { 
      status: 502,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
}

// General application error handler
export function handleAppError(error: any, context?: string): Response {
  AppErrorHandler.logError(error, { context });
  
  return new Response(
    JSON.stringify({ 
      error: 'Application error',
      context,
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }),
    { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
}