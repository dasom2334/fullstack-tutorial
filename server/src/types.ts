import { Request, Response } from 'express';
import { Session } from "express-session";
import Redis from "ioredis";

import { userSession } from "./resolvers/User";

export type MyContext = {
    req: Request & { session?: Session & userSession };
    redis: Redis;
    res: Response;
}
