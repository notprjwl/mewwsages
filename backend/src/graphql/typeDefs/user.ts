import { gql } from "apollo-server-core";

// this is not a typescript, it is a schema definition language
const typeDefs = gql`
  # this user type does not expose any functionality to the client. It simply defines the structure of the user model in the application.
  type SearchedUser {
    id: String
    username: String
    image: String
  }

  # to add functionality to the API you need to add fields to root types of the graphQl schema. which is query, mutation and subscription.

  # reading data here. declaring query
  type Query {
    searchUsers(username: String): [SearchedUser] #searchUsers is the query name, username is the arg, type is the string which is similar to typescript. [User] means it is going to return an array of users. [] this is how they declare an array in query language.
  }

  # declaring mutation. In mutation we are going to perform the operations.
  type Mutation {
    createUsername(username: String): createUsernameResponse
  }

  # this is how we create a custom types in querying lanugage
  type createUsernameResponse {
    success: Boolean
    error: String
  } 
`;

export default typeDefs;
