import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Continuum } from '@kinotic/continuum-client';
import { ThreatContextInterceptor } from './threat-context.interceptor';

async function bootstrap() {
  // Initialize Continuum connection (replace with your actual connection details)
  const connectionInfo = {
    host: 'localhost',
    port: 5672,
    connectHeaders: { login: 'guest', passcode: 'guest' }
  };
  await Continuum.connect(connectionInfo);

  // Create NestJS standalone application context
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Register the context interceptor
  const interceptor = app.get(ThreatContextInterceptor);
  Continuum.serviceRegistry.registerContextInterceptor(interceptor);

  console.log('Threat Service application started');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await Continuum.disconnect();
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
