import { Threat } from './threat';
import { Context } from './graphql.types';
import axios from 'axios';

const threatResolver = {
  Query: {
    checkThreat: async (_: unknown, { indicator }: { indicator: string }, context: Context): Promise<Threat> => {
      const { config } = context;
      if (!config) {
        throw new Error('Configuration not found');
      }
      const url = `https://pulsedive.com/api/info.php?indicator=${indicator}&key=${config.apiKey}`;
      try {
        const response = await axios.get<{ risk: string }>(url);
        return new Threat(indicator, response.data.risk === 'none' ? 'safe' : 'malicious');
      } catch {
        return new Threat(indicator, 'error');
      }
    },
  },
};

const resolvers = {
  ...threatResolver,
};

export { resolvers };
