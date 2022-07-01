// import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
// import { Post } from "./entities/Post";
// import mikroConfig from "./mikro-orm.config";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/Post";
import { UserResolver } from "./resolvers/User";
import AppDataSource from "./typeormAppDataSource";

const main = async () => {
  AppDataSource.initialize()
    .then(() => {
      // here you can start to work with your database
    })
    .catch((error) => console.log(error));


  const app = express();

  let RedisStore = connectRedis(session);

  const redisClient = new Redis();

  const whitelist = [
    "http://localhost:3000",
    "https://localhost:3000",
    "https://studio.apollographql.com",
  ];
  const corsOptions = {
    // origin: "http://localhost:3000",
    // origin: "https://studio.apollographql.com",
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, origin?: boolean) => void
    ): void {
      if (origin && whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else if (origin === undefined && !__prod__) {
        // codegen works here
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }, // codegen not worked.
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient as any,
        disableTouch: true,
        disableTTL: true,
      }),
      cookie: {
        maxAge: 10000 * 60 * 60 * 24 * 365 * 10, // 10 years,,
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax",
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
    context: ({ req, res }) => ({ req, res, redis: redisClient }),
  });
  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("server start port 4000");
  });
};
main().catch((err) => {
  console.error(err);
});
