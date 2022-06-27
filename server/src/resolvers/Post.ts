import { MyContext } from "src/types";
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";
import { Post } from '../entities/Post';
import { sleep } from "../utils/sleep";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
        await sleep(3000);
        return em.find(Post, {});
    }
    @Query(() => Post, { nullable: true })
    post(
        @Arg('identifier', () => Int) _id: number,
        @Ctx() { em }: MyContext
        ): Promise<Post | null> {
        return em.findOne(Post, { _id });
    }
    @Query(() => Post)
    async createPost(
        @Arg('title', () => String) title: string,
        @Ctx() { em }: MyContext
        ): Promise<Post | null> {
        const post = em.create(Post, { title });
        await em.persistAndFlush(post);
        return post;
    }
    @Query(() => Post)
    async updatePost(
        @Arg('identifier', () => Int) _id: number,
        @Arg('title', () => String, { nullable: true }) title: string,
        @Ctx() { em }: MyContext
        ): Promise<Post | null> {
        const post = await em.findOne(Post, {_id});
        if (!post) {
            return null;
        }
        if ( typeof title !== 'undefined') {
            post.title = title;
            await em.persistAndFlush(post);
        }
        // const post = em.create(Post, { title });
        return post;
    }
    @Mutation(() => Boolean)
    async deletePost(
        @Arg('identifier', () => Int) _id: number,
        @Ctx() { em }: MyContext
        ): Promise<boolean> {
        await em.nativeDelete(Post, { _id });
        return true;
    }
}