import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  _id!: number;

  
  @Field()
  @Column()
  value!: number;

  @Field()
  @PrimaryColumn()
  user_id!: number;

  @Field(() => User, {nullable:true})
  @ManyToOne(() => User, (user) => user.updoots)
  user!: User;

  @Field()
  @PrimaryColumn()
  post_id!: number;

  @Field(() => Post, {nullable:true})
  @ManyToOne(() => Post, (post) => post.creator)
  post!: Post;
}
