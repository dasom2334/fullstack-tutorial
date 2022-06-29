import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Resolver,
  Mutation,
  Arg,
  Ctx,
  Field,
  ObjectType,
  Query,
} from "type-graphql";
import argon2 from "argon2";
// import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import {
  COOKIE_NAME,
  FORGET_PASSWORD_PREFIX,
  TIME_ONE_DAY,
} from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateUser";
import { sendEmail } from "..//utils/sendEmail";
import { v4 } from "uuid";

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
  // @Mutation(() => UserResponse)
  // async changePassword(
  //   @Arg('token') token: string,
  //   @Arg('newPassword') newPassword:string,
  //   @Ctx() {}: MyContext
  // ) {

  // }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });
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
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, {
      _id: req.session.userId,
    });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      console.log(errors);
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    // const user = em.create(User, {
    //   username: options.username,
    //   password: hashedPassword,
    // });
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          email: options.email,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");

      user = result[0];
      // await em.persistAndFlush(user);
    } catch (err: any) {
      const constraint = err.constraint.split("_");
      const field = constraint[1];
      let message = "Unhandled Error";
      if (constraint[2] === "unique") {
        message = `${field} already taken!`;
      }
      return { errors: [{ field, message }] };
    }
    req.session!.userId = user._id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req, res }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
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
    console.log(res);
    console.log(req.session);
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
