import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheService {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async get(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, expire?: number): Promise<'OK'> {
    return this.redisClient.set(key, value, 'EX', expire ?? 10);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }
}
