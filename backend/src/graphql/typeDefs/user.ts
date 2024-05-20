import { gql } from "apollo-server-core";

// this is not a typescript, it is a graph querying language
const typeDefs = gql`
  type User {
    id: String
    username: String
  }

  # reading data here. declaring query
  type Query {
    searchUsers(username: String): [User] #searchUsers is the query name, username is the arg, type is the string which is similar to typescript. [User] means it is going to return an array of users. [] this is how they declare an array in query language.
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
