import {User} from '../entities/User';
import {Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver} from 'type-graphql';
import {MyContext} from '../types';
import argon2 from 'argon2';
import {EntityManager} from '@mikro-orm/postgresql';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

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
  @Query(() => User, {nullable: true}) // get current logged in user based on cookie
  async me(@Ctx() {req, em}: MyContext) {
    // not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, {id: req.session.userId});
    return user;
  }

  @Mutation(() => UserResponse) // first graphql query where schema is single query hello
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() {em, req}: MyContext,
  ): Promise<UserResponse> {
    const {username, password} = options;
    if (username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username must be longer than 2',
          },
        ],
      };
    }

    if (password.length <= 2) {
      return {
        errors: [
          {
            field: 'password',
            message: 'password must be longer than 2',
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(password);\
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');
        user = result[0];
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
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() {em, req}: MyContext,
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {username: options.username});
    if (!user) {
      return {
        errors: [{field: 'username', message: 'username does not exist'}],
      };
    }
    const isValid = await argon2.verify(user.password, options.password);
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
}
