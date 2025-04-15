import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThreatsModule } from './threats/threats.module.js';
import { ConfigModule } from './config/config.module.js';
import { JwtGuard } from './auth/jwt.guard.js';
import { APP_GUARD } from '@nestjs/core';
import { CustomContext } from './graphql.context.js';
import { Request } from 'express';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: true,
      context: ({ req }: { req: Request }): CustomContext => ({ req }),
    }),
    ThreatsModule,
    ConfigModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
