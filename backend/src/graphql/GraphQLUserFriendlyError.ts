import { GraphQLError } from 'graphql';

export const GRAPHQL_USER_FRIENDLY_ERROR = 'GRAPHQL_USER_FRIENDLY_ERROR';

export default class GraphQLUserFriendlyError extends GraphQLError {
  constructor(message: string) {
    super(message, {extensions: {code: GRAPHQL_USER_FRIENDLY_ERROR}});
    this.name = GRAPHQL_USER_FRIENDLY_ERROR;
  }
}
