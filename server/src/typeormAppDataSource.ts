import path from "path";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";


const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "tutorial",
  password: "tutorial",
  database: "tutorial2",
  entities: [Post, User],
  migrations: [path.join(__dirname, "./migrations/*")],
  synchronize: true,
  logging: true,
});
export default AppDataSource;
