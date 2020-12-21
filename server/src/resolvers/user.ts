import {User} from '../entities/User';
import {Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver} from 'type-graphql';
import {MyContext} from '../types';
import argon2 from 'argon2';
import {COOKIE_NAME, FORGET_PASSWORD_PREFIX} from '../constants';
import {UsernamePasswordInput} from './UsernamePasswordInput';
import {validateRegister} from '../utils/validateRegister';
import {sendEmail} from '../utils/sendEmail';
import {v4} from 'uuid';
import {getConnection} from 'typeorm';

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

// ObjectTypes are things you can return
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() {redis}: MyContext) {
    const user = await User.findOne({where: {email}}); // email is not primary key hence need to use where
    if (!user) {
      // email not in db, do nothing
      return true;
    }

    const token = v4(); // generate unique random token
    await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3); // store token to redis
    // token will be sent along request, which we will look up and validate against the user id
    await sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`);
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() {redis, req}: MyContext,
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'new password must be longer than 2',
          },
        ],
      };
    }

    // check if token matches with redis
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token invalid or expired',
          },
        ],
      };
    }

    // get current user
    const user = await User.findOne(parseInt(userId));
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists',
          },
        ],
      };
    }

    await User.update({id: parseInt(userId)}, {password: await argon2.hash(newPassword)});
    await redis.del(FORGET_PASSWORD_PREFIX + token); // cannot use the same token twice for changing password
    req.session.userId = user.id; // log in user after change password
    return {user};
  }

  @Query(() => User, {nullable: true}) // get current logged in user based on cookie
  me(@Ctx() {req}: MyContext) {
    // not logged in
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse) // first graphql query where schema is single query hello
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() {req}: MyContext,
  ): Promise<UserResponse> {
    const {username, email, password} = options;
    const errors = validateRegister(options);
    if (errors) return {errors};
    const hashedPassword = await argon2.hash(password);
    let user;
    try {
      // the same thing but shorter: User.create({username: username, email: email, password: hashedPassword}).save()'
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({username: username, email: email, password: hashedPassword})
        .returning('*')
        .execute();
      user = result.raw[0];
    } catch (e) {
      if (e.code === '23505' || e.detail.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'user already exists',
            },
          ],
        };
      }
    }

    // store user id session
    // sets cookie on the user which keeps them logged in
    req.session.userId = user.id;
    return {user};
  }
  // Example query
  // mutation{
  //   register(options: {username: "jamessspanggg", password: "1234"}) {
  //     errors {
  //       field
  //       message
  //     }
  //     user {
  //       username
  //     }
  //   }
  // }

  @Mutation(() => UserResponse) // first graphql query where schema is single query hello
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() {req}: MyContext,
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@') ? {where: {email: usernameOrEmail}} : {where: {username: usernameOrEmail}},
    );
    if (!user) {
      return {
        errors: [{field: 'usernameOrEmail', message: 'username does not exist'}],
      };
    }
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return {
        errors: [{field: 'password', message: 'invalid password'}],
      };
    }

    // we can store anything within the session variable, in our case
    req.session.userId = user.id;

    return {user};
  }
  // Example Query
  // mutation{
  //   login(options: {username: "jamessspanggg", password: "1234"}) {
  //     errors {
  //       field
  //       message
  //     }
  //     user {
  //       username
  //     }
  //   }
  // }

  @Mutation(() => Boolean)
  async logout(@Ctx() {req, res}: MyContext): Promise<Boolean> {
    // remove session and clear cookie
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
      }),
    );
  }
}
