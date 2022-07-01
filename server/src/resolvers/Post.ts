import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";

@InputType()
class PostInput {
  @Field()
  title!: string;

  @Field()
  text!: string;
}
@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }
  @Query(() => Post, { nullable: true })
  post(@Arg("identifier", () => Int) _id: number): Promise<Post | null> {
    return Post.findOneBy({ _id });
  }
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }
  @Query(() => Post)
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("identifier", () => Int) _id: number,
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ _id });

    if (!post) {
      return null;
    }

    if (post.creatorId !== req.session.userId) {
      return null;

    }
    Post.update({ _id }, { ...input });
    return post;
  }
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("identifier", () => Int) _id: number
  ): Promise<boolean> {
    await Post.delete(_id);
    return true;
  }
}
