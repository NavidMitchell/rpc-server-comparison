import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { ThreatsService } from './threats.service';
import { Threat } from './threats.model';
import { CustomContext } from '../graphql.context';

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
