import {
  createClient,
  Provider,
  dedupExchange,
  fetchExchange,
  Query,
  stringifyVariables,
} from "urql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { beeterUpdateQuery } from "./beeterUpdateQuery";

import { filter, pipe, tap } from "wonka";
import { Exchange } from "urql";
import router from "next/router";

// import { stringifyVariables } from '@urql/core';
// import { Resolver, Variables, NullArray } from '../types';

// type MergeMode = 'before' | 'after';

// interface PaginationParams {
//   offsetArgument?: string;
//   limitArgument?: string;
//   mergeMode?: MergeMode;
// }

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
    console.log("??????????????");
    return results;
  };
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
          createPost: (_result, args, cache, info) => {
            const key = "Query";
            const fieldName = "posts";
            cache.invalidate(key, fieldName, {limit:10});
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
