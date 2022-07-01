import { ObjectType, Field } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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


}