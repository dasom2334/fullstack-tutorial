import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field, Mutation, ObjectType,
  Query, Resolver
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
// import { UniqueConstraintViolationException } from "@mikro-orm/core";
import AppDataSource from "../typeormAppDataSource";
import { v4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";
import {
  COOKIE_NAME,
  FORGET_PASSWORD_PREFIX,
  TIME_ONE_DAY
} from "../constants";
import {
  errorGenerater,
  validateChangePassword,
  validateRegister
} from "../utils/validateUser";
import { UsernamePasswordInput } from "./UsernamePasswordInput";

export interface userSession {
  userId: number;
}

@ObjectType()
export class FieldError {
  @Field()
  field!: string;
  @Field()
  message?: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateChangePassword(newPassword);
    if (errors.length > 0) return { errors };
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return { errors: [errorGenerater("token", "token expired.")] };
    }
    const uid = parseInt(userId);
    const user = await User.findOneBy({ _id: uid });
    if (!user) {
      return { errors: [errorGenerater("token", "user no longer exists.")] };
    }
    user.password = await argon2.hash(newPassword);

    await User.update(
      { _id: uid },
      { password: await argon2.hash(newPassword) }
    );
    await redis.del(key);
    req.session.userId = user._id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOneBy({ email });
    if (!user) {
      return true;
    }
    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user._id,
      "EX",
      TIME_ONE_DAY * 3
      // (err) => {
      //   if (err) {
      //     // Something went wrong
      //     console.error("error");
      //  } else {
      //   redis.get("test", function(err, value) {
      //           if (err) {
      //               console.error("error");
      //           } else {
      //               console.log("Worked: " + value);
      //           }
      //      });
      //  }
      // }
    );
    const html = `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`;
    await sendEmail(email, html);
    return true;
  }
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const user = await User.findOneBy({
      _id: req.session.userId,
    });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors.length > 0) return { errors };
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await AppDataSource.createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
          // created_at: new Date(),
          // updated_at: new Date(),
        })
        .returning("*")
        .execute();

      user = result.raw[0];
      // await em.persistAndFlush(user);
    } catch (err : any) {
      console.log(err);
      const detail = err.detail;
      
      let field = 'undefined';
      let message = "Unhandled Error";
      if (err.code == '23505') {
        if (detail.includes('username')) field = 'username';
        if (detail.includes('email')) field = 'email';
        message = 'Aleady Taken.';
      }
      // const field = constraint[1];
      // let message = "Unhandled Error";
      // if (constraint[2] === "unique") {
      //   message = `${field} already taken!`;
      // }
      return { errors: [errorGenerater(field, message)] };
      // return { errors: [errorGenerater("jest", "in case")] };
    }
    req.session!.userId = user._id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req, res }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOneBy(
      !usernameOrEmail.includes("@")
        ? { username: usernameOrEmail }
        : { email: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username Or Email doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    // req.session!.userId = user._id;
    req.session!.userId = user._id;
    res.cookie("userId", user._id);
    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
