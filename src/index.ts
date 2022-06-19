import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants"
// import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/Post";
import 'reflect-metadata';
import { UserResolver } from "./resolvers/User";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    // const post = orm.em.fork({}).create(Post, {title: 'my first post'});
    // await orm.em.persistAndFlush(post);
    // await orm.em.nativeInsert(Post, {title: 'my second post'});

    // const posts = await orm.em.find(Post, {});
    // console.log(posts);
    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: () => ({ em: orm.em })
    });
    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

    // app.get('/', (_, res) => {
    //     res.send('hello');
    // });
    app.listen(4000, () => {
        console.log('server start port 4000');
    });
};
main().catch(err => {
    console.error(err);
});
// console.log('hiwefwefhwefwefei');
//# sourceMappingURL=index.js.map