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
    // console.log(_parent, fieldArgs, cache, entityKey, fieldName);
    // console.log('---------------------------:');
    // console.log('_parent:', _parent);
    // console.log('fieldArgs:', fieldArgs);
    // console.log('cache:', cache);
    // console.log('entityKey:', entityKey);
    // console.log('fieldName:', fieldName);
    const allFields = cache.inspectFields(entityKey);
    // console.log('allFields:', allFields);
    const fieldInfos = allFields.filter(
      (info) => info.fieldName === fieldName
    );

    // console.log('fieldInfos:', fieldInfos);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(entityKey, fieldKey);
    info.partial = !isItInTheCache;
    const results: string[] = [];
    // console.log(fieldKey);
    // console.log(fieldArgs);
    // console.log(isItInTheCache);
    // console.log(fieldKey, fieldArgs, isItInTheCache, info);
    console.log('fieldInfos', fieldInfos);
    fieldInfos.forEach((element) => {
      console.log('--------------------&&');
      console.log('entityKey:', entityKey);
      console.log('fieldKey:', element.fieldKey);
      const data = cache.resolve(
        entityKey,
        element.fieldKey
      ) as string[];
      console.log('data:', data.sort());
      results.push(...data);
    });
    console.log('--------------------!!');

    console.log(results);
    return results;
    // cache.resolve(entityKey, fieldKey) as string[];

    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolve(entityKey, fieldKey) as string[];
    //   const currentOffset = args[offsetArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== 'number'
    //   ) {
    //     continue;
    //   }

    //   const tempResult: NullArray<string> = [];

    //   for (let j = 0; j < links.length; j++) {
    //     const link = links[j];
    //     if (visited.has(link)) continue;
    //     tempResult.push(link);
    //     visited.add(link);
    //   }

    //   if (
    //     (!prevOffset || currentOffset > prevOffset) ===
    //     (mergeMode === 'after')
    //   ) {
    //     result = [...result, ...tempResult];
    //   } else {
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
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
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
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
