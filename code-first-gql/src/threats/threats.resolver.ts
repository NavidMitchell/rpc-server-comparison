import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { ThreatsService } from './threats.service.js';
import { Threat } from './threats.model.js';
import { CustomContext } from '../graphql.context.js';

@Resolver(() => Threat)
export class ThreatsResolver {
  constructor(private readonly threatsService: ThreatsService) {}

  @Query(() => Threat)
  async checkThreat(
    @Args('indicator') indicator: string,
    @Context() context: CustomContext,
  ): Promise<Threat> {
    const config = context.config;
    if (!config) {
      throw new Error('Configuration not found');
    }
    return this.threatsService.checkThreat(indicator, config);
  }
}
