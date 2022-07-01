import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

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
  @Query(() => Post)
  async createPost(
    @Arg("title", () => String) title: string
  ): Promise<Post | null> {
    return Post.create({ title }).save();
  }
  @Query(() => Post)
  async updatePost(
    @Arg("identifier", () => Int) _id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ _id });

    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      Post.update({ _id }, { title });
    }
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
