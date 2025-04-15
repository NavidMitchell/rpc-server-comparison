import axios, { AxiosInstance } from 'axios';
import { Publish, Context } from '@kinotic/continuum-client';
import { CustomerConfiguration } from './CustomerConfiguration';

interface ThreatAssessment {
  status: 'Low' | 'Medium' | 'High';
  details: string;
  pulseDiveData?: {
    risk: string;
    indicator: string;
    summary?: string;
  };
}

@Publish('com.example.threat')
export class ThreatService {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: 'https://pulsedive.com/api/',
    });
  }

  async checkThreat(
    threatLevel: number,
    indicator: string,
    @Context() config: CustomerConfiguration,
  ): Promise<ThreatAssessment> {
    if (threatLevel < 0 || threatLevel > 10) {
      throw new Error('Threat level must be between 0 and 10');
    }

    const status = threatLevel >= 7 ? 'High' : threatLevel >= 4 ? 'Medium' : 'Low';
    const pulseDiveApiKey = config.apiKey;

    let pulseDiveData: ThreatAssessment['pulseDiveData'];
    try {
      const response = await this.httpClient.get('info.php', {
        params: {
          indicator,
          key: pulseDiveApiKey,
        },
      });

      const data = response.data;
      pulseDiveData = {
        risk: data.risk || 'Unknown',
        indicator: data.indicator || indicator,
        summary: data.summary || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to fetch PulseDive data: ${JSON.stringify(error, null, 2)}`);
    }

    const details = `Threat assessed for customer ${config.customerId}: ${indicator} (PulseDive risk: ${pulseDiveData.risk})`;

    return { status, details, pulseDiveData };
  }

}
