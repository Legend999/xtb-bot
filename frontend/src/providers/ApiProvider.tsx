import {
  ApolloClient,
  ApolloProvider,
  from,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error/index';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions/index';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { Kind, OperationTypeNode } from 'graphql/index';
import { useSnackbar } from 'notistack';
import { ReactNode, useMemo } from 'react';

const httpLink = new HttpLink({
  uri: '/graphql',
});

const wsLink = new GraphQLWsLink(createClient({
  url: '/subscriptions',
  shouldRetry: () => true,
  retryAttempts: Infinity,
}));

const splitLink = split(
  ({query}) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.operation === OperationTypeNode.SUBSCRIPTION
    );
  },
  wsLink,
  httpLink,
);

interface ApiProviderProps {
  children: ReactNode;
}

function ApiProvider({children}: ApiProviderProps) {
  const {enqueueSnackbar} = useSnackbar();

  const client = useMemo(() => {
    const errorLink = onError(({graphQLErrors, networkError}) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({message}) => {
          enqueueSnackbar(message, {variant: 'error'});
        });
      }

      if (networkError) {
        enqueueSnackbar(`Network error: ${networkError.message}`, {variant: 'error'});
      }
    });

    return new ApolloClient({
      link: from([errorLink, splitLink]),
      cache: new InMemoryCache({
        typePolicies: {
          Subscription: {
            fields: {
              stocksPriceChange: {
                merge: false,
              },
            },
          },
        },
      }),
    });
  }, [enqueueSnackbar]);

  return <ApolloProvider client={client}>
    {children}
  </ApolloProvider>;
}

export default ApiProvider;
