import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";
export const createUpdootLoader = () => {
  return new DataLoader<{ post_id: number; user_id: number }, Updoot>(
    async (keys) => {
      const updoots = await Updoot.createQueryBuilder()
        .whereInIds(keys)
        .getMany();
      const updootIdsToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((updoot) => {
        updootIdsToUpdoot[`${updoot.user_id}|${updoot.post_id}`] = updoot;
      });

      const data = keys.map(
        (key) => updootIdsToUpdoot[`${key.user_id}|${key.post_id}`]
      );
      console.log(updoots);
      console.log(updootIdsToUpdoot);
      console.log(data);
      return data;
    }
  );
};
