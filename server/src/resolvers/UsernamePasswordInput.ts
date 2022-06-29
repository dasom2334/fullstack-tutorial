import {
  InputType,
  Field
} from "type-graphql";


@InputType()
export class UsernamePasswordInput {
  @Field()
  password!: string;

  @Field()
  email?: string;

  @Field()
  username?: string;
}
