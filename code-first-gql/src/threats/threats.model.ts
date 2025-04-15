import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Threat {
  @Field()
  indicator: string;

  @Field()
  status: string;
}
