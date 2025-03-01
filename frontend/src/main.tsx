import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions/index';
import { getMainDefinition } from '@apollo/client/utilities';
import ErrorNotification from '@components/ErrorNotification.tsx';
import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider,
} from '@mui/material';
import { Kind, OperationTypeNode } from 'graphql';
import { createClient } from 'graphql-ws';
import { SnackbarProvider } from 'notistack';
import { createRoot } from 'react-dom/client';
import '@fontsource/montserrat/300.css'; // Light
import '@fontsource/montserrat/400.css'; // Regular
import '@fontsource/montserrat/500.css'; // Medium
import '@fontsource/montserrat/700.css'; // Bold
import App from 'src/App.tsx';
import 'src/App.scss';

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

const client = new ApolloClient({
  link: splitLink,
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

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#171b1c',
        paper: '#101415',
      },
      primary: {
        main: '#946E15',
      },
    },
    typography: {
      fontFamily: 'Montserrat, Arial, sans-serif',
    },
  }),
);

createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        Components={{
          error: ErrorNotification,
        }}
        classes={{
          root: 'overwrite-root-notistack',
        }}
      >
        <App/>
      </SnackbarProvider>
    </ThemeProvider>
  </ApolloProvider>,
);
