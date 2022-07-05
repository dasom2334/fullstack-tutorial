import { ObjectType, Field } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Post } from './Post';

@ObjectType()
@Entity()
export class User extends BaseEntity{
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
  @Column({ unique: true })
  username!: string;
  
  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;
  
  // @Field()
  // @Column('jsonb', {nullable: true})
  @OneToMany(() => Post, post => post.creator)
  posts?: Post[];
}