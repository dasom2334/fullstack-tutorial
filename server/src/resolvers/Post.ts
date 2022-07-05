import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation, Query,
  Resolver,
  Root,
  UseMiddleware
} from "type-graphql";
import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
import { isAuth } from "../middleware/isAuth";
import AppDataSource from "../typeormAppDataSource";
import { MyContext } from "../types";

@InputType()
class PostInput {
  @Field()
  title!: string;

  @Field()
  text!: string;
}


@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  async vote(
    @Arg("post_id", () => Int) post_id: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;
    // const { userId } = { userId: 1 };
    let isSafe = true;
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Updoot)
      .values([{ user_id: userId, post_id, value }])
      .execute()
      .catch((err) => {
        console.log(err);
        isSafe = false;
      });
    if (isSafe) {
      await AppDataSource.createQueryBuilder()
        .update(Post)
        .set({ point: () => `point + ${realValue}` })
        .where("Post._id = :post_id", { post_id })
        .execute()
        .catch((err) => {
          console.log(err);
          isSafe = false;
      });
    }
    return isSafe;
  }

  @Query(() => [Post])
  async posts(
    @Arg("limit") limit: number,
    @Arg("offset") offset: number = 0,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);
    const result = AppDataSource.getRepository(Post)
      .createQueryBuilder("Post")
      .leftJoinAndSelect(
        "Post.creator",
        "Creator",
        `Creator._id = Post.creator_id`
      )
      .orderBy("Post.createdAt", "DESC")
      .addOrderBy("Post._id", "DESC")
      .offset(offset)
      .limit(realLimit);
    // .take(realLimit);
    if (cursor) {
      result.where("Post.createdAt > :cursor", {
        cursor: cursor ? new Date(cursor) : null,
      });
    }
    console.log(await result.getRawMany());
    return result.getMany();
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
    return Post.create({ ...input, creator_id: req.session.userId }).save();
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

    if (post.creator_id !== req.session.userId) {
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
