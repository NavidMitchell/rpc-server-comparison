import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ThreatsResolver } from './threats.resolver';
import { ThreatsService } from './threats.service';

@Module({
  imports: [HttpModule],
  providers: [ThreatsResolver, ThreatsService],
})
export class ThreatsModule {}
