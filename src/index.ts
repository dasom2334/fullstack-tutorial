import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/Post";
import "reflect-metadata";
import { UserResolver } from "./resolvers/User";
import session from "express-session";
import { createClient } from "redis";
import connectRedis from "connect-redis";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();
  // const post = orm.em.fork({}).create(Post, {title: 'my first post'});
  // await orm.em.persistAndFlush(post);
  // await orm.em.nativeInsert(Post, {title: 'my second post'});

  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
  const app = express();

  let RedisStore = connectRedis(session);
  // const { createClient } = require("redis")

  // const redisClient = createClient({
  //   legacyMode: true,
  //   url: '127.0.0.1:6379',
  // });
  // await redisClient.connect().catch(console.error);

  let redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);
  // const redisClient = createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient as any,
        disableTouch: true,
        disableTTL: true,
      }),
      cookie: {
        maxAge: 10000* 60 * 60 * 24 * 365 * 10, // 10 years,,
        httpOnly: true,
        secure: __prod__,
        sameSite: 'lax',
      },
      saveUninitialized: false,
      secret: "keyboard cat",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({req, res}) => ({ em: orm.em, req, res }),
  });
  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  // app.get('/', (_, res) => {
  //     res.send('hello');
  // });
  app.listen(4000, () => {
    console.log("server start port 4000");
  });
};
main().catch((err) => {
  console.error(err);
});
// console.log('hiwefwefhwefwefei');
//# sourceMappingURL=index.js.map
