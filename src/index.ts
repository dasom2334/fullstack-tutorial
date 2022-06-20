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
import session from 'express-session';
import { createClient } from "redis";
import connectRedis from 'connect-redis';

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

  let redisClient = createClient({ legacyMode: true })
  redisClient.connect().catch(console.error)
  // const redisClient = createClient(); 

  app.use(
    session({
      store: new RedisStore({
         client: redisClient as any,
         disableTouch: true,
         disableTTL: true,
        }),
      saveUninitialized: false,
      secret: "keyboard cat",
      resave: false,
    })
  )
//   const RedisStore = connectRedis(session);
//   const redisClient = createClient({ legacyMode: true });
//   redisClient.connect().catch(console.error);

//   app.use(
//     session({
//       store: new RedisStore({ 
//         // client: redisClient,
//             client: redisClient,
//             disableTouch: true,
//         }),
//       saveUninitialized: false,
//       secret: "IMissYouZesu",
//       resave: false,
//     })
//   );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
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
