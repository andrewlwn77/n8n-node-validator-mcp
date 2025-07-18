/**
 * Cache manager for storing GitHub API responses and parsed specifications
 */

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  size: number;
  hitRate: number;
  totalRequests: number;
  totalHits: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private stats = {
    totalRequests: 0,
    totalHits: 0
  };

  constructor(
    private defaultTtl: number = 3600000, // 1 hour in milliseconds
    private maxSize: number = 1000
  ) {}

  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl
    };

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    this.stats.totalRequests++;

    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    this.stats.totalHits++;
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats.totalRequests = 0;
    this.stats.totalHits = 0;
  }

  getStats(): CacheStats {
    return {
      size: this.cache.size,
      hitRate: this.stats.totalRequests > 0 ? this.stats.totalHits / this.stats.totalRequests : 0,
      totalRequests: this.stats.totalRequests,
      totalHits: this.stats.totalHits
    };
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Number.MAX_SAFE_INTEGER;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}