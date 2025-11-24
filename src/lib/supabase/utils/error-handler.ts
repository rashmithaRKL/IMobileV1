export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

export function handleSupabaseError(error: any): never {
  // Parse Supabase error
  if (error?.code && error?.message) {
    throw new SupabaseError(
      error.message,
      error.code,
      error.statusCode,
      error.details
    )
  }

  // Parse PostgREST error
  if (error?.code && error?.details) {
    const message = error.message || error.details
    throw new SupabaseError(message, error.code, error.statusCode, error.details)
  }

  // Generic error
  throw new SupabaseError(
    error?.message || 'An unexpected error occurred',
    error?.code,
    error?.statusCode
  )
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on auth errors or client errors
      if (error instanceof SupabaseError) {
        if (error.statusCode && error.statusCode < 500) {
          throw error
        }
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError!
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof SupabaseError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof SupabaseError) {
    return error.statusCode === undefined || error.statusCode >= 500
  }
  
  return false
}
