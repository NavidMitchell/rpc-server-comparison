import { Continuum } from '@kinotic/continuum-client';
import { ThreatService } from './ThreatService';
import { ThreatContextInterceptor } from './ThreatContextInterceptor';
import { ConfigService } from './ConfigService';

async function bootstrap() {
  // Initialize Continuum connection
  const connectionInfo = {
    host: 'localhost',
    port: 5672,
    connectHeaders: { login: 'guest', passcode: 'guest' },
  };
  await Continuum.connect(connectionInfo);

  // Initialize services
  const configService = new ConfigService();
  const interceptor = new ThreatContextInterceptor(configService);
  const threatService = new ThreatService();

  // Register the context interceptor
  Continuum.serviceRegistry.registerContextInterceptor(interceptor);

  console.log('Threat Service application started');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await Continuum.disconnect();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
