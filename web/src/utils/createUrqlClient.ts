import { Cache, cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange, gql, stringifyVariables } from "urql";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import { beeterUpdateQuery } from "./beeterUpdateQuery";

import router from "next/router";
import { Exchange } from "urql";
import { pipe, tap } from "wonka";

const cursorPagination = (cursor?: string): Resolver => {
  // const date = cursor? new Date(cursor):null;
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(entityKey, fieldKey);
    info.partial = !isItInTheCache;
    const results: string[] = [];
    fieldInfos.forEach((element) => {
      const data = cache.resolve(entityKey, element.fieldKey) as string[];
      results.push(...data);
    });
    return results;
  };
};

const invalidateAllArgFields = (
  key: string,
  fieldName: string,
  cache: Cache
) => {
  const allFields = cache.inspectFields(key);
  const nameFields = allFields.filter((e) => e.fieldName === fieldName);
  nameFields.forEach((e) => {
    cache.invalidate(key, fieldName, e.arguments);
  });
};

export const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        // If the OperationResult has an error send a request to sentry
        if (error) {
          if (error?.message.includes("Not Authenticated")) {
            router.replace("/login");
          }
        }
      })
    );
  };

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          vote: (result, args, cache, info) => {
            if (result.vote === 0) return;
            const { post_id, value } = args as VoteMutationVariables;
            const data = cache.readFragment(
              gql`
                fragment _ on Post {
                  _id
                  point
                  updoots {
                    value
                  }
                }
              `,
              { _id: post_id }
            );
            console.log(data, result, args);
            if (data) {
              const newPoint = (result.vote as number) + data.point;
              console.log(newPoint);
              cache.writeFragment(
                gql`
                  fragment __ on Post {
                    point
                    updoots {
                      value
                    }
                  }
                `,
                {
                  _id: post_id,
                  point: newPoint,
                  updoots: [{ value: (result.vote as number) > 0 ? 1 : -1 }],
                }
              );

              const data2 = cache.readFragment(
                gql`
                  fragment ___ on Post {
                    _id
                    point
                    upboots {
                      value
                    }
                  }
                `,
                { _id: post_id }
              );
              console.log(data2);
            }
          },
          createPost: (_result, args, cache, info) => {
            invalidateAllArgFields("Query", "posts", cache);
          },
          logout: (_result, args, cache, info) => {
            beeterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
          },
          login: (_result, args, cache, info) => {
            beeterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                    // me: 5,
                  };
                }
              }
            );
            invalidateAllArgFields("Query", "posts", cache);
          },
          register: (_result, args, cache, info) => {
            beeterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                    // me: 5,
                  };
                }
              }
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
