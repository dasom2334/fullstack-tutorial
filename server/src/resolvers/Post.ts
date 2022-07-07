import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { QueryBuilder } from "typeorm";
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

  @Mutation(() => Int)
  async vote(
    @Arg("post_id", () => Int) post_id: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;
    const updoot = await Updoot.findOne({
      where: { post_id, user_id: userId },
    });

    let isSafe = true;
    let addPoint = 0;

    let qb = AppDataSource.createQueryBuilder() as QueryBuilder<Updoot>;
    if (updoot && updoot.value !== undefined) {
      if (updoot.value == realValue) {
        return addPoint;
      }
      qb = qb
        .update(Updoot)
        .set({ value: realValue })
        .where("Updoot.user_id = :userId AND Updoot.post_id = :post_id", {
          userId,
          post_id,
        });
    } else if (!updoot) {
      qb = qb
        .insert()
        .into(Updoot, ["user_id", "post_id", "value"])
        .values([{ user_id: userId, post_id, value: realValue }]);
    }
    await qb.execute().catch((err) => {
      console.log(err);
      isSafe = false;
    });
    if (isSafe) {
      if (updoot && updoot.value !== undefined) {
        addPoint = realValue == 1 ? 2 : -2;
      } else {
        addPoint = realValue;
      }
      await AppDataSource.createQueryBuilder()
        .update(Post)
        .set({ point: () => `point + ${addPoint}` })
        .where("Post._id = :post_id", { post_id })
        .execute()
        .catch((err) => {
          console.log(err);
          isSafe = false;
        });
    }
    return addPoint;
  }

  @Query(() => [Post])
  async posts(
    @Arg("limit") limit: number,
    @Arg("offset") offset: number = 0,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<Post[]> {
    const { userId } = req.session;
    const realLimit = Math.min(50, limit);
    let result = AppDataSource.getRepository(Post)
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
    if (userId) {
      result = result.leftJoinAndSelect(
        "Post.updoots",
        "UserUpdoot",
        `UserUpdoot.user_id = ${userId} 
        AND Post._id = UserUpdoot.post_id`
      );
    }
    // .take(realLimit);
    if (cursor) {
      result = result.where("Post.createdAt > :cursor", {
        cursor: cursor ? new Date(cursor) : null,
      });
    }
    // console.log(await result.getRawMany());
    // const data = await result.getMany();
    // console.log(data[0]['updoots'], await result.getRawMany());
    return result.getMany();
  }
  @Query(() => Post, { nullable: true })
  post(@Arg("identifier", () => Int) _id: number): Promise<Post | null> {
    return AppDataSource.getRepository(Post)
      .createQueryBuilder("Post")
      .leftJoinAndSelect(
        "Post.creator",
        "Creator",
        `Creator._id = Post.creator_id`
      )
      .where("Post._id = :_id", { _id })
      .getOne();
  }
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    return Post.create({ ...input, creator_id: req.session.userId }).save();
  }
  @Mutation(() => Post)
  // @UseMiddleware(isAuth)
  async updatePost(
    @Arg("identifier", () => Int) _id: number,
    @Arg("input") input: PostInput,
    // @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ _id });

    if (!post) {
      throw new Error('403 Error');
    }
    post.title = input.title;
    post.text = input.text;
    
    return post.save();
  }
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("identifier", () => Int) _id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOneBy({ _id });
    if (!post) {
      return false;
    }
    if (post.creator_id !== req.session.userId) {
      throw new Error("not authorized");
    }
    await Post.delete({ _id });
    return true;
  }
}
