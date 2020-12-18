import {Query, Resolver} from 'type-graphql';

@Resolver()
export class HelloResolver {
  @Query(() => String) // first graphql query where schema is single query hello
  hello() {
    return 'bye world';
  }
}
