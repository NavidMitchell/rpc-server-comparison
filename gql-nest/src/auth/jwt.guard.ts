import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jose from 'jose';
import { FlattenedJWSInput, JSONWebKeySet, JWSHeaderParameters } from 'jose';
import { ConfigService } from '../config/config.service.js';
import { CustomContext } from '../graphql.context.js';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtGuard implements CanActivate {
  private trustedIssuers: string[];
  private jwks: {
    (
      protectedHeader?: JWSHeaderParameters,
      token?: FlattenedJWSInput,
    ): Promise<CryptoKey>;
    coolingDown: boolean;
    fresh: boolean;
    reloading: boolean;
    reload: () => Promise<void>;
    jwks: () => JSONWebKeySet | undefined;
  } | null = null;

  constructor(private readonly configService: ConfigService) {
    this.trustedIssuers = [
      'https://tenant1.idp.com/',
      'https://tenant2.idp.com/',
    ];
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<CustomContext>();

    const authHeader = gqlContext.req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    try {
      if (this.jwks == null) {
        this.jwks = jose.createRemoteJWKSet(
          new URL(process.env.JWKS_URL as string),
          {
            cooldownDuration: 30000, // Optional: Cooldown for fetching JWKS (in ms)
          },
        );
      }

      const { payload } = await jose.jwtVerify(token, this.jwks, {
        issuer: this.trustedIssuers,
      });
      const realm = payload['realm'] as string;

      if (realm) {
        return false;
      }

      gqlContext.config = this.configService.getConfigForRealm(realm);
      return true;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return false;
    }
  }
}
