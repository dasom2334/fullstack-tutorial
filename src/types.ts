import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core"
import { Request, Response } from 'express';
import { Session } from "express-session";
import { userSession } from "./resolvers/User";

export type MyContext = {
    em: EntityManager<IDatabaseDriver<Connection>>;
    req: Request & { session?: Session & userSession };
    res: Response;
}
