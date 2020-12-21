import 'reflect-metadata'; // for typeorm
import {ApolloServer} from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import Redis from 'ioredis';
import session from 'express-session';
import {createConnection} from 'typeorm';

// types
import {buildSchema} from 'type-graphql';

// resolvers
import {HelloResolver} from './resolvers/hello';
import {PostResolver} from './resolvers/post';
import {UserResolver} from './resolvers/user';

// database

import {COOKIE_NAME, __prod__} from './constants';
import {MyContext} from './types';
import {Post} from './entities/Post';
import {User} from './entities/User';

const main = async () => {
  dotenv.config(); // loads env file

  const connection = await createConnection({
    type: 'postgres',
    database: 'lireddit2',
    entities: [Post, User],
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    logging: true,
    synchronize: true,
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(
    // prevent cors from front end
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
    session({
      cookie: {
        httpOnly: true, // cannot access cookie in front end
        maxAge: 1000 * 60 * 60 * 24 * 365, // one year
        sameSite: 'lax', // CSRF
        secure: __prod__, // cookie only works in https, which is in production
      },
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      saveUninitialized: false,
      secret: 'env variable',
      resave: false,
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({req, res}): MyContext => ({req, res, redis}),
  });

  apolloServer.applyMiddleware({app, cors: false}); // setup graphql server

  app.get('/', (_, res) => {
    res.send('hello');
  });
  app.listen(4000, () => {
    console.log('server started on localhost:4000');
  });
};

main().catch((err) => {
  console.error(err);
});
