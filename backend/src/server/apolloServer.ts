import { ApolloServer } from '@apollo/server';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { expressMiddleware } from '@apollo/server/express4';
import {
  ApolloServerPluginDrainHttpServer,
} from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import express from 'express';
import { readFileSync } from 'fs';
import { useServer } from 'graphql-ws/use/ws';
import http from 'http';
import path from 'path';
import XtbPage from 'src/browser/xtb/xtbPage.js';
import ApiPubSub from 'src/graphql/ApiPubSub.js';
import {
  GRAPHQL_USER_FRIENDLY_ERROR,
} from 'src/graphql/GraphQLUserFriendlyError.js';
import { resolvers } from 'src/graphql/resolvers.js';
import { WebSocketServer } from 'ws';

export interface Context {
  xtbPage: XtbPage;
  pubsub: ApiPubSub;
}

export default async (xtbPage: XtbPage, port: number) => {
  const typeDefs = readFileSync(path.resolve(import.meta.dirname, '../../../shared/schema.graphql'), 'utf8');
  const schema = makeExecutableSchema({typeDefs, resolvers});
  const app = express();
  const httpServer = http.createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/subscriptions',
  });
  const pubsub = new ApiPubSub();
  const serverCleanup = useServer({
    schema,
    context: async () => (Promise.resolve({
      xtbPage: xtbPage,
      pubsub: pubsub,
    })),
  }, wsServer);

  const server = new ApolloServer<Context>({
    schema,
    status400ForVariableCoercionErrors: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({httpServer}),
      {
        async serverWillStart() {
          return Promise.resolve({
            async drainServer() {
              await serverCleanup.dispose();
            },
          });
        },
      },
    ],
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

  await server.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async () => (Promise.resolve({
        xtbPage: xtbPage,
        pubsub: pubsub,
      })),
    }),
  );

  httpServer.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log('🚀 Server is ready!');
  });
}
