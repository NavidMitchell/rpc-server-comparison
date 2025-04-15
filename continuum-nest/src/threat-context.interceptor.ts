import { Injectable } from '@nestjs/common';
import { IEvent } from '@kinotic/continuum-client';
import { ContextInterceptor, ServiceContext } from '@kinotic/continuum-client';
import { ConfigService, CustomerConfiguration } from './config.service';

@Injectable()
export class ThreatContextInterceptor implements ContextInterceptor<CustomerConfiguration> {
  constructor(private readonly configService: ConfigService) {}

  async intercept(
    event: IEvent,
    _context: ServiceContext,
  ): Promise<CustomerConfiguration> {
    const headers = event.headers;
    const realm = headers.get('x-realm') || 'default';
    return this.configService.getConfigForRealm(realm);
  }
}
