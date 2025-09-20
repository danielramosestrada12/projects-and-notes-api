import NodeCache from "node-cache";
import { CacheOptions } from "../types";

class Cache {
  private cache: NodeCache;
  private defaultTTL: number = 900;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: this.defaultTTL,
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false, // Better performance, but be careful with object mutations
      deleteOnExpire: true,
      maxKeys: 10000,
    });

    this.cache.on("set", (key, value) => {
      console.log(`Cache SET: ${key}`);
    });

    this.cache.on("del", (key, value) => {
      console.log(`Cache DELETED: ${key}`);
    });

    this.cache.on("expired", (key, value) => {
      console.log(`Cache EXPIRED: ${key}`);
    });

    console.log("Node Cache initialized");
  }

  private getKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  get<T>(key: string, options?: CacheOptions): T | undefined {
    try {
      const fullKey = this.getKey(key, options?.prefix);
      const value = this.cache.get<T>(fullKey);

      if (value !== undefined) {
        console.log(`Cache HIT: ${fullKey}`);
      } else {
        console.log(`Cache MISS: ${fullKey}`);
      }

      return value;
    } catch (error) {
      console.error("Cache get error:", error);
      return undefined;
    }
  }

  set<T>(key: string, value: T, options?: CacheOptions): boolean {
    try {
      const fullKey = this.getKey(key, options?.prefix);
      const ttl = options?.ttl || this.defaultTTL;

      const success = this.cache.set(fullKey, value, ttl);
      console.log(
        `Cache SET: ${fullKey} (TTL: ${ttl}s) - ${
          success ? "SUCCESS" : "FAILED"
        }`
      );

      return success;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  del(key: string | string[], options?: CacheOptions): number {
    try {
      const keys = Array.isArray(key) ? key : [key];
      const fullKeys = keys.map((k) => this.getKey(k, options?.prefix));

      const deletedCount = this.cache.del(fullKeys);
      console.log(
        `Cache DEL: ${fullKeys.join(", ")} - Deleted: ${deletedCount}`
      );

      return deletedCount;
    } catch (error) {
      console.error("Cache delete error:", error);
      return 0;
    }
  }
}

export default new Cache();
