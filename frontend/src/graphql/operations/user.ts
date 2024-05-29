import { gql } from "@apollo/client";

export default {
  Queries: {
    searchUsers: gql `
      query searchUsers($username: String!) {
        searchUsers(username: $username) {
          id,
          username,
          image
        }
      }
    `
  },
  Mutations: {
    createUsername: gql`
      mutation CreateUsername($username: String!) {
        createUsername(username: $username) {
            success,
            error
        }
      }
    `,
  },
  Subscriptions: {},
};
