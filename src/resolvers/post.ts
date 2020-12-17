import { Post } from '../entities/Post';
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { MyContext } from '../types';

@Resolver()
export class PostResolver {
  @Query(() => [Post]) // first graphql query where schema is single query hello
  posts(@Ctx() {em}: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }
  // Example Query:
  // posts {
  //     id
  //     createdAt
  //     updatedAt
  //     title
  //   }
  // }

  @Query(() => Post, { nullable: true }) // first graphql query where schema is single query hello
  post(
    // note: within the arg is the graphql type, after arg is typescript type
    @Arg('id', () => Int) id: number,
    @Ctx() {em}: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, {id});
  }
  // Example Query:
  // {
  //   post (id: 3) {
  //     title
  //   }
  // }

  @Mutation(() => Post) // first graphql query where schema is single query hello
  async createPost(
    // note: within the arg is the graphql type, after arg is typescript type
    @Arg('title', () => String) title: string,
    @Ctx() {em}: MyContext
  ): Promise<Post> {
    const post = em.create(Post, {title});
    await em.persistAndFlush(post);
    return post;
  }
  // Example Query
  // mutation {
  //   createPost(title: "post from graphql") {
  //     id
  //     createdAt
  //     updatedAt
  //     title
  //   }
  // }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() {em}: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, {id});
    if (!post) return null;
    if (typeof title !== 'undefined') {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }
  // Example query
  // mutation {
  //   updatePost(id: 1, title: "bob") {
  //     id
  //     createdAt
  //     updatedAt
  //     title
  //   }
  // }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() {em}: MyContext
  ): Promise<Boolean> {
    try {
      await em.nativeDelete(Post, {id});
      return true;
    } catch (e) {
      return false;
    }
  }
}