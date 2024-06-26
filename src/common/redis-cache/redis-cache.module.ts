import { Module } from '@nestjs/common';
import { RedisModule } from '@songkeys/nestjs-redis';
import { RedisCacheService } from './redis-cache.service';

@Module({
  imports: [RedisModule],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
