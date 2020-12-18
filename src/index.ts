import "reflect-metadata";
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import express from 'express';
import { MikroORM } from "@mikro-orm/core";

// types
import { buildSchema } from 'type-graphql';

// resolvers
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from "./resolvers/user";

// database
import mikroConfig from './mikro-orm.config';

import { __prod__ } from './constants';

const main = async () => {
  dotenv.config(); // loads env file
  const orm = await MikroORM.init(mikroConfig);
  orm.getMigrator().up(); // automatically run the migrations that were created
  
  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em })
  })

  apolloServer.applyMiddleware({app}); // setup graphql server

  app.get('/', (_, res) => {
    res.send('hello');
  })
  app.listen(4000,  () => {
    console.log('server started on localhost:4000');
  })
}

main().catch(err => {
  console.error(err);
})
