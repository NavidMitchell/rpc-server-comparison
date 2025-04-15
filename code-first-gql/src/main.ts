import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    console.log('Application is running on port 3000');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

await bootstrap();
