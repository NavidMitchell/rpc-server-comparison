import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Threat } from './threats.model.js';
import { CustomerConfiguration } from '../graphql.context.js';

interface PulsediveResponse {
  risk: string;
}

@Injectable()
export class ThreatsService {
  constructor(private readonly httpService: HttpService) {}

  async checkThreat(
    indicator: string,
    config: CustomerConfiguration,
  ): Promise<Threat> {
    const url = `https://pulsedive.com/api/info.php?indicator=${indicator}&key=${config.apiKey}`;
    try {
      const response = await lastValueFrom(
        this.httpService.get<PulsediveResponse>(url),
      );
      const data = response.data;
      return {
        indicator,
        status: data.risk === 'none' ? 'safe' : 'malicious',
      };
    } catch {
      return { indicator, status: 'error' };
    }
  }
}
