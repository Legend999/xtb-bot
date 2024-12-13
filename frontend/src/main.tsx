import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { createRoot } from 'react-dom/client';
import App from './App';

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <App/>
  </ApolloProvider>,
);
