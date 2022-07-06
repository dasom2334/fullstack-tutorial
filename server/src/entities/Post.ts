import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field()
  @CreateDateColumn()
  createdAt?: Date = new Date();

  @Field()
  @UpdateDateColumn()
  updatedAt?: Date = new Date();

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ default: 0 })
  point!: number;

  @Field()
  @Column()
  creator_id!: number;

  @Field({ nullable: true })
  @ManyToOne(() => User, (user) => user.posts)
  creator?: User;

  @Field(() => [Updoot], { nullable: true })
  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots?: Updoot[];

  // @Field()
  // @OneToOne(() =>> Updoot, updoot => updoot.post)
  // updoot?: Updoot;
}
