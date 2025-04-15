import { Request } from 'express';

export interface CustomContext {
  req: Request;
  config?: CustomerConfiguration;
}

export interface JwtClaims {
  iss: string;
  realm: string;
}

export interface CustomerConfiguration {
  customerId: string;
  apiKey: string;
}
