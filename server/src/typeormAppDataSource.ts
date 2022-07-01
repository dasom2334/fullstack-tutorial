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
  synchronize: true,
  logging: true,
});
export default AppDataSource;
