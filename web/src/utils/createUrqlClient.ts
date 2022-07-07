import { Cache, cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
  ClientOptions,
  dedupExchange,
  fetchExchange,
  gql,
  stringifyVariables,
} from "urql";
import {
  DeletePostMutationVariables,
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
import { NextUrqlClientConfig, SSRExchange } from "next-urql";
import { isServer } from "./isServer";
import { NextPageContext } from "next";

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
export const createUrqlClient = (
  ssrExchange: SSRExchange,
  ctx?: NextPageContext
): ClientOptions => {
  let cookie = undefined;
  if (ctx) {
    cookie = ctx.req?.headers.cookie;
  }
  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
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
            deletePost: (result, args, cache, info) => {
              cache.invalidate({
                __typename:"Post",
                _id:(args as DeletePostMutationVariables).identifier
              });
            },
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
              if (data) {
                const newPoint = (result.vote as number) + data.point;
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
              invalidateAllArgFields("Query", "posts", cache);
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
  };
};
