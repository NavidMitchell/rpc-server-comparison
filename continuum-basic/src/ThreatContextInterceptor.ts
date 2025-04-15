import { IEvent, ContextInterceptor, ServiceContext } from '@kinotic/continuum-client';
import { ConfigService } from './ConfigService';
import { CustomerConfiguration } from './CustomerConfiguration';

export class ThreatContextInterceptor implements ContextInterceptor<CustomerConfiguration> {
  constructor(private readonly configService: ConfigService) {}

  async intercept(event: IEvent, context: ServiceContext): Promise<CustomerConfiguration> {
    const headers = event.headers;
    const realm = headers.get('x-realm') || 'default';
    return this.configService.getConfigForRealm(realm);
  }
}
