import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ThreatsResolver } from './threats.resolver.js';
import { ThreatsService } from './threats.service.js';

@Module({
  imports: [HttpModule],
  providers: [ThreatsResolver, ThreatsService],
})
export class ThreatsModule {}
