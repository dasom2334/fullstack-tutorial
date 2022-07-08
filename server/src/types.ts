import { Request, Response } from 'express';
import { Session } from "express-session";
import Redis from "ioredis";

import { userSession } from "./resolvers/User";
import { createUpdootLoader } from './utils/createUpdootLoader';
import { createUserLoader } from './utils/createUserLoader';

export type MyContext = {
    req: Request & { session?: Session & userSession };
    redis: Redis;
    res: Response;
    userLoader: ReturnType<typeof createUserLoader>;
    updootLoader: ReturnType<typeof createUpdootLoader>;
}
