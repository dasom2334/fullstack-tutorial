import path from "path";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import { User } from "./entities/User";


const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "tutorial",
  password: "tutorial",
  database: "tutorial2",
  entities: [Post, User, Updoot],
  migrations: [path.join(__dirname, "./migrations/*")],
  synchronize: true,
  logging: true,
});
export default AppDataSource;
