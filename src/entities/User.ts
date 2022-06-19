import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryKey()
  _id!: number;

  @Field()
  @Property()
  createdAt?: Date = new Date();

  @Field()
  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();

  @Field()
  @Property({ unique: true })
  username!: string;

  @Property()
  password!: string;


}