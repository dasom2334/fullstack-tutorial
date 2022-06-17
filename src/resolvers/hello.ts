import { Resolver, Query } from 'type-graphql';

@Resolver()
export class HelloResolver {
    @Query(() => String)
    hello() {
        return "hello world";
    }
    @Query(() => String)
    hello2() {
        return "hello world and you";
    }
}