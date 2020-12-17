import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import dotenv from 'dotenv';

dotenv.config(); // loads env file

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
  entities: [Post], // all database tables
  dbName: 'lireddit',
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  type: 'postgresql',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0]; // get the type that MikroORM.init() expects
