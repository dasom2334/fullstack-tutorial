import DataLoader from "dataloader";
import { User } from "../entities/User";
export const createUserLoader = () => {
  console.log("hihihih");
  return new DataLoader<number, User>(async (user_ids) => {
    console.log("HELLOHEEHLO");
    console.log(user_ids);
    const users = await User.createQueryBuilder()
      .whereInIds(user_ids as number[])
      .getMany();
    const userIdToUser: Record<number, User> = {};
    users.forEach((u: User) => {
      userIdToUser[u._id] = u;
    });


     const data = user_ids.map((user_id) => userIdToUser[user_id]);
     return data;
  });
};
