import { CustomerConfiguration } from './CustomerConfiguration';

export class ConfigService {
  getConfigForRealm(realm: string): CustomerConfiguration {
    const configs: Record<string, CustomerConfiguration> = {
      tenant1: { customerId: 'cust1', apiKey: 'pulsedive_key_tenant1' },
      tenant2: { customerId: 'cust2', apiKey: 'pulsedive_key_tenant2' },
    };
    return configs[realm] || { customerId: 'default', apiKey: 'default_key' };
  }
}
