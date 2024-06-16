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

  /**
   * 사용자 온라인 관련 메서드들
   */
  async setUserOnline(userId: string): Promise<void> {
    await this.redisClient.sadd('online_users', userId);
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.redisClient.srem('online_users', userId);
  }

  async getOnlineUsers(): Promise<string[]> {
    return this.redisClient.smembers('online_users');
  }

  /**
   * 채팅 큐 관련 메서드들
   */
  async addUserToChatQueue(userId: string): Promise<void> {
    await this.redisClient.lpush('chat_queue', userId);
  }
  async removeUserFromChatQueue(userId: string): Promise<void> {
    await this.redisClient.lrem('chat_queue', 0, userId);
  }
  async getNextUserFromChatQueue(): Promise<string> {
    return this.redisClient.rpop('chat_queue');
  }
}
