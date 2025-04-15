import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground';
import { createRemoteJWKSet, jwtVerify, JWSHeaderParameters, FlattenedJWSInput, JSONWebKeySet } from 'jose';
import { readFileSync } from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Context } from './graphql.types';
import { resolvers } from './resolvers';
import { ConfigService } from './config.service';
import * as dotenv from 'dotenv';
import express, { Request } from 'express';
import http from 'http';

dotenv.config();

// GraphQL Type Definitions
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

// Cache for JWKS
interface CachedJWKS {
  jwks: {
    (
      protectedHeader?: JWSHeaderParameters,
      token?: FlattenedJWSInput,
    ): Promise<CryptoKey>;
    coolingDown: boolean;
    fresh: boolean;
    reloading: boolean;
    reload: () => Promise<void>;
    jwks: () => JSONWebKeySet | undefined;
  };
  expiry: number;
}

let cachedJWKS: CachedJWKS | null = null;
const JWKS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Middleware to Parse JWT and Inject Config
const jwksMiddleware = async (req: Request): Promise<Context> => {
  const trustedIssuers = ['https://tenant1.idp.com/', 'https://tenant2.idp.com/'];
  const configService = new ConfigService();

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { config: null };
  }

  const token = authHeader.split(' ')[1];
  try {
    let jwks = cachedJWKS?.jwks;
    if (!jwks || cachedJWKS!.expiry <= Date.now()) {
      jwks = createRemoteJWKSet(
        new URL(process.env.JWKS_URL as string),
        {
          cooldownDuration: 30000,
        },
      );
      cachedJWKS = {
        jwks,
        expiry: Date.now() + JWKS_CACHE_DURATION,
      };
    }

    const { payload } = await jwtVerify(token, jwks, {
      issuer: trustedIssuers,
    });
    const realm = payload['realm'] as string;

    if (!realm) {
      return { config: null };
    }

    const config = await configService.getConfigForRealm(realm);
    return { config };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return { config: null };
  }
};

// Create Apollo Server
const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer<Context>({
  schema,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

// Start Server
const startServer = async () => {
  try {
    const app = express();
    const httpServer = http.createServer(app);

    await server.start();

    app.use(
      '/graphql',
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => jwksMiddleware(req),
      }),
    );

    const port = 4000;
    await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
