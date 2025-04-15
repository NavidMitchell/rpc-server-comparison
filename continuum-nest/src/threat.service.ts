import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Publish, Context } from '@kinotic/continuum-client';
import { firstValueFrom } from 'rxjs';

interface CustomerConfiguration {
  customerId: string;
  apiKey: string;
}

interface ThreatAssessment {
  status: 'Low' | 'Medium' | 'High';
  details: string;
  pulseDiveData?: {
    risk: string;
    indicator: string;
    summary?: string;
  };
}

@Injectable()
@Publish('com.example.threat')
export class ThreatService {
  constructor(private readonly httpService: HttpService) {}

  public async assessThreat(
    threatLevel: number,
    indicator: string,
    @Context() config: CustomerConfiguration,
  ): Promise<ThreatAssessment> {
    if (threatLevel < 0 || threatLevel > 10) {
      throw new HttpException(
        'Threat level must be between 0 and 10',
        HttpStatus.BAD_REQUEST,
      );
    }

    const status = threatLevel >= 7 ? 'High' : threatLevel >= 4 ? 'Medium' : 'Low';
    const pulseDiveApiKey = config.apiKey;

    let pulseDiveData: ThreatAssessment['pulseDiveData'];
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://pulsedive.com/api/info.php', {
          params: {
            indicator,
            key: pulseDiveApiKey,
          },
        }),
      );

      const data = response.data;
      pulseDiveData = {
        risk: data.risk || 'Unknown',
        indicator: data.indicator || indicator,
        summary: data.summary || undefined,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch PulseDive data: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const details = `Threat assessed for customer ${config.customerId}: ${indicator} (PulseDive risk: ${pulseDiveData.risk})`;

    return { status, details, pulseDiveData };
  }

}
