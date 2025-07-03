import { ApiMetrics, RequestDebounceOptions } from './types';

// Metrics tracking
class ApiMetricsTracker {
  private metrics: ApiMetrics = {
    requestCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    errorRate: 0,
    lastReset: Date.now(),
  };

  private responseTimes: number[] = [];
  private errorCount = 0;

  recordRequest(responseTime: number, fromCache: boolean = false) {
    this.metrics.requestCount++;

    if (fromCache) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
      this.responseTimes.push(responseTime);
      this.updateAverageResponseTime();
    }
  }

  recordError() {
    this.errorCount++;
    this.updateErrorRate();
  }

  private updateAverageResponseTime() {
    if (this.responseTimes.length > 0) {
      const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
      this.metrics.averageResponseTime = sum / this.responseTimes.length;
    }
  }

  private updateErrorRate() {
    this.metrics.errorRate =
      this.metrics.requestCount > 0
        ? (this.errorCount / this.metrics.requestCount) * 100
        : 0;
  }

  getMetrics(): ApiMetrics {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      requestCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastReset: Date.now(),
    };
    this.responseTimes = [];
    this.errorCount = 0;
  }
}

export const apiMetrics = new ApiMetricsTracker();

// Request deduplication
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear() {
    this.pendingRequests.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Debounced requests
export const createDebouncedRequest = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RequestDebounceOptions
) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;
  let maxTimeoutId: NodeJS.Timeout | null = null;

  return (...args: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      const now = Date.now();

      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Handle maxWait
      if (options.maxWait && !maxTimeoutId) {
        maxTimeoutId = setTimeout(() => {
          maxTimeoutId = null;
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          fn(...args)
            .then(resolve)
            .catch(reject);
        }, options.maxWait);
      }

      // Handle leading edge
      if (options.leading && now - lastCallTime > options.delay) {
        lastCallTime = now;
        fn(...args)
          .then(resolve)
          .catch(reject);
        return;
      }

      // Set up trailing call
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (maxTimeoutId) {
          clearTimeout(maxTimeoutId);
          maxTimeoutId = null;
        }
        lastCallTime = Date.now();
        fn(...args)
          .then(resolve)
          .catch(reject);
      }, options.delay);
    });
  };
};

// Progressive data loading
export class ProgressiveLoader<T> {
  private loadedData: T[] = [];
  private loading = false;
  private hasMore = true;
  private currentPage = 0;

  constructor(
    private loadFunction: (page: number, pageSize: number) => Promise<T[]>,
    private pageSize: number = 20,
    private maxItems?: number
  ) {}

  async loadNext(): Promise<T[]> {
    if (this.loading || !this.hasMore) {
      return this.loadedData;
    }

    this.loading = true;

    try {
      const newData = await this.loadFunction(this.currentPage, this.pageSize);

      if (newData.length < this.pageSize) {
        this.hasMore = false;
      }

      this.loadedData.push(...newData);
      this.currentPage++;

      if (this.maxItems && this.loadedData.length >= this.maxItems) {
        this.hasMore = false;
        this.loadedData = this.loadedData.slice(0, this.maxItems);
      }

      return this.loadedData;
    } finally {
      this.loading = false;
    }
  }

  reset() {
    this.loadedData = [];
    this.loading = false;
    this.hasMore = true;
    this.currentPage = 0;
  }

  getData(): T[] {
    return [...this.loadedData];
  }

  isLoading(): boolean {
    return this.loading;
  }

  canLoadMore(): boolean {
    return this.hasMore && !this.loading;
  }
}

// Memory-efficient caching with LRU eviction
export class LRUCache<T> {
  private cache = new Map<
    string,
    { value: T; timestamp: number; accessCount: number }
  >();
  private accessOrder: string[] = [];

  constructor(
    private maxSize: number = 100,
    private ttl: number = 300000 // 5 minutes default
  ) {}

  set(key: string, value: T): void {
    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.remove(key);
    }

    // If cache is full, remove least recently used
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
    });
    this.accessOrder.push(key);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.remove(key);
      return null;
    }

    // Update access order
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(key);
    }

    entry.accessCount++;
    return entry.value;
  }

  private remove(key: string): void {
    this.cache.delete(key);
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > this.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.remove(key));
  }
}

// Background prefetching
export class BackgroundPrefetcher {
  private prefetchQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private maxConcurrency = 3;

  addToPrefetch(prefetchFn: () => Promise<any>) {
    this.prefetchQueue.push(prefetchFn);
    this.processPrefetchQueue();
  }

  private async processPrefetchQueue() {
    if (this.isProcessing || this.prefetchQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.prefetchQueue.length > 0) {
        const batch = this.prefetchQueue.splice(0, this.maxConcurrency);
        await Promise.allSettled(batch.map((fn) => fn()));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  clear() {
    this.prefetchQueue = [];
  }
}

export const backgroundPrefetcher = new BackgroundPrefetcher();

// Smart retry with exponential backoff
export const smartRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Connection health checker
export class ConnectionHealthChecker {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Array<(online: boolean) => void> = [];

  constructor() {
    // Only add event listeners in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners();
      });
    }
  }

  addListener(callback: (online: boolean) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (online: boolean) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.isOnline));
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  async pingServer(
    url: string = 'https://pokeapi.co/api/v2/pokemon/1'
  ): Promise<boolean> {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const connectionHealthChecker = new ConnectionHealthChecker();
