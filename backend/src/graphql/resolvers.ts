import logIn from '../browser/xtb/actions/logIn.js';
import { Resolvers } from './resolvers.generated.js';

export const resolvers: Resolvers = {
  Query: {
    test: () => 'Test',
  },
  Mutation: {
    logIn: async (_, {email, password}, {xtbPage}) => {
      await logIn(xtbPage, email, password);
      return true;
    },
  },
};
