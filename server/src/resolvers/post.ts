import {Post} from '../entities/Post';
import {Arg, Int, Mutation, Query, Resolver} from 'type-graphql';

@Resolver()
export class PostResolver {
  @Query(() => [Post]) // first graphql query where schema is single query hello
  posts(): Promise<Post[]> {
    return Post.find();
  }
  // Example Query:
  // posts {
  //     id
  //     createdAt
  //     updatedAt
  //     title
  //   }
  // }

  @Query(() => Post, {nullable: true}) // first graphql query where schema is single query hello
  post(
    // note: within the arg is the graphql type, after arg is typescript type
    @Arg('id', () => Int) id: number,
  ): Promise<Post | undefined> {
    return Post.findOne(id);
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
  ): Promise<Post> {
    return Post.create({title}).save();
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

  @Mutation(() => Post, {nullable: true})
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, {nullable: true}) title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) return null;
    if (typeof title !== 'undefined') {
      post.title = title;
      await Post.update({id}, {title});
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
  async deletePost(@Arg('id', () => Int) id: number): Promise<Boolean> {
    await Post.delete(id);
    return true;
  }
  // Example query
  // mutation {
  //   deletePost(id: 1)
  // }
}
