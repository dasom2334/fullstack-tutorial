import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column()
  value!: number;

  @Field()
  @PrimaryColumn()
  user_id!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.updoots)
  user!: User;

  @Field()
  @PrimaryColumn()
  post_id!: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.creator)
  post!: Post;
}
