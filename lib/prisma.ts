import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Configure connection pool behavior
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
  var prismaGlobal: PrismaClientSingleton | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Wrapper to handle transient database connection errors.
 * Retries the operation up to `maxRetries` times on connection failures.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const errorMessage = lastError.message || '';

      // Check if it's a connection-related error worth retrying
      const isConnectionError =
        errorMessage.includes('Server has closed the connection') ||
        errorMessage.includes('Connection refused') ||
        errorMessage.includes('Connection timed out') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('ETIMEDOUT');

      if (!isConnectionError || attempt === maxRetries) {
        throw lastError;
      }

      console.warn(`[Prisma] Connection error, retrying (${attempt}/${maxRetries})...`);

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
}

export default prisma;
