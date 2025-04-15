import { Module } from '@nestjs/common';
import { ThreatService } from './threat.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from './config.service';
import { ThreatContextInterceptor } from './threat-context.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
  ],
  providers: [ThreatService, ConfigService, ThreatContextInterceptor],
})
export class AppModule {}
