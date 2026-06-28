import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseSafeAsyncOptions {
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
}

interface UseSafeAsyncReturn<T> {
  execute: (asyncFn: () => Promise<T>) => Promise<T | undefined>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useSafeAsync<T = unknown>(
  options: UseSafeAsyncOptions = {}
): UseSafeAsyncReturn<T> {
  const { onError, showErrorToast = true } = options;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        if (mountedRef.current) {
          setError(error);
          setIsLoading(false);

          if (showErrorToast) {
            // Handle specific error types
            if (error.message.includes('429') || error.message.includes('Rate limit')) {
              toast({
                title: 'Too Many Requests',
                description: 'Please wait a moment before trying again.',
                variant: 'destructive',
              });
            } else if (error.message.includes('402') || error.message.includes('credits')) {
              toast({
                title: 'Credits Exhausted',
                description: 'Please add credits to continue using AI features.',
                variant: 'destructive',
              });
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
              toast({
                title: 'Connection Error',
                description: 'Please check your internet connection and try again.',
                variant: 'destructive',
              });
            } else {
              toast({
                title: 'Error',
                description: error.message || 'Something went wrong. Please try again.',
                variant: 'destructive',
              });
            }
          }

          onError?.(error);
        }
        return undefined;
      }
    },
    [toast, showErrorToast, onError]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, isLoading, error, reset };
}
