import {ColorModeProvider, CSSReset, ThemeProvider} from '@chakra-ui/react';
import {Provider, createClient, dedupExchange, fetchExchange} from 'urql';
import {cacheExchange, Cache, QueryInput} from '@urql/exchange-graphcache';
import theme from '../theme';
import {LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation} from '../generated/graphql';

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query,
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

const client = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include',
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          login: (_result, args, cache, info) => {
            // update MeQuery in graphql cache, since cache might have outdated data when login
            betterUpdateQuery<LoginMutation, MeQuery>(cache, {query: MeDocument}, _result, (result, query) => {
              if (result.login.errors) {
                return query;
              } else {
                return {
                  me: result.login.user,
                };
              }
            });
          },
          logout: (_result, args, cache, info) => {
            // update MeQuery cache to return null
            betterUpdateQuery<LogoutMutation, MeQuery>(cache, {query: MeDocument}, _result, () => ({me: null}));
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(cache, {query: MeDocument}, _result, (result, query) => {
              if (result.register.errors) {
                return query;
              } else {
                return {
                  me: result.register.user,
                };
              }
            });
          },
        },
      },
    }),
    fetchExchange,
  ],
});

function MyApp({Component, pageProps}) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <CSSReset />
          <Component {...pageProps} />
        </ColorModeProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
