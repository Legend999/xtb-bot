import { ApolloServer } from '@apollo/server';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import XtbPage from '../browser/xtb/xtbPage.js';
import { resolvers } from '../graphql/resolvers.js';
import { GRAPHQL_USER_FRIENDLY_ERROR } from './graphQLUserFriendlyError.js';

export default async function startApolloServer(xtbPage: XtbPage, port: number) {
  const typeDefs = readFileSync('../shared/schema.graphql', 'utf8');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError) => {
      switch (formattedError.extensions?.code) {
        case GRAPHQL_USER_FRIENDLY_ERROR:
          return {message: formattedError.message};
        case ApolloServerErrorCode.INTERNAL_SERVER_ERROR:
          // eslint-disable-next-line no-console
          console.error(formattedError);
          return {message: 'An unexpected error occurred.'};
        default:
          return formattedError;
      }
    },
  });

  const {url} = await startStandaloneServer(server, {
    listen: {port: port},
    context: async () => (Promise.resolve({
      xtbPage: xtbPage,
    })),
  });

  // eslint-disable-next-line no-console
  console.log(`🚀 Server is running on: ${url}`);
}
